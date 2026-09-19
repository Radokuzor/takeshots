import { NextRequest, NextResponse } from "next/server";
import type { DocumentReference } from "firebase-admin/firestore";
import { ANALYTICS_COLLECTION, adminDb } from "@/lib/firebaseAdmin";
import { esc, notifyTelegram } from "@/lib/telegram";
import type { AnalyticsEvent, PageVisit, SessionPayload } from "@/lib/analytics";
import { countryFlag, formatDuration, getClientContext, referrerHost } from "@/lib/analyticsServer";
import type { AnalyticsSession } from "@/lib/types";

const pageKey = (p: PageVisit) => `${p.enteredAt}|${p.path}`;
const eventKey = (e: AnalyticsEvent) => `${e.at}|${e.name}|${e.path}`;

function str(v: unknown, max = 300) {
  return typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  let body: Partial<SessionPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = str(body.sessionId, 64);
  const incomingPages = (Array.isArray(body.pages) ? body.pages : [])
    .filter((p) => p && typeof p.path === "string" && typeof p.enteredAt === "number")
    .slice(0, 200);
  if (!sessionId || incomingPages.length === 0 || !body.startedAt || !body.endedAt) {
    return NextResponse.json({ ok: true });
  }

  const ctx = getClientContext(req.headers);
  if (ctx.deviceType === "bot") return NextResponse.json({ ok: true });

  // Analytics must never fail the request — the beacon is fire-and-forget.
  let docRef: DocumentReference | null = null;
  let existing: AnalyticsSession | null = null;
  try {
    docRef = adminDb().collection(ANALYTICS_COLLECTION).doc(sessionId);
    const snapshot = await docRef.get();
    existing = (snapshot.exists ? snapshot.data() : null) as AnalyticsSession | null;
  } catch (err) {
    console.error("Failed to read analytics session:", err);
  }

  // Merge with any earlier snapshot — a full page load (e.g. Stripe's redirect
  // back to /checkout/return) restarts the tracker's in-memory page list.
  const pageMap = new Map<string, PageVisit>();
  for (const p of existing?.pages ?? []) pageMap.set(pageKey(p), p);
  for (const p of incomingPages) {
    pageMap.set(pageKey(p), {
      path: p.path.slice(0, 300),
      enteredAt: p.enteredAt,
      exitedAt: typeof p.exitedAt === "number" ? p.exitedAt : null,
      maxScrollPct: Math.max(0, Math.min(100, Number(p.maxScrollPct) || 0)),
    });
  }
  const pages = [...pageMap.values()].sort((a, b) => a.enteredAt - b.enteredAt);

  const eventMap = new Map<string, AnalyticsEvent>();
  for (const e of existing?.events ?? []) eventMap.set(eventKey(e), e);
  for (const e of (Array.isArray(body.events) ? body.events : []).slice(0, 150)) {
    if (e && typeof e.name === "string" && typeof e.at === "number") eventMap.set(eventKey(e), e);
  }
  const events = [...eventMap.values()].sort((a, b) => a.at - b.at).slice(0, 500);

  const startedAt = Math.min(body.startedAt, existing ? Date.parse(existing.started_at) : Infinity);
  const endedAt = Math.max(body.endedAt, existing ? Date.parse(existing.ended_at) : 0);
  const durationMs = Math.max(0, endedAt - startedAt);
  const maxScrollPct = Math.max(0, ...pages.map((p) => p.maxScrollPct ?? 0));
  const reachedCheckout = pages.some((p) => p.path.startsWith("/checkout"));
  const purchased = !!body.purchased || !!existing?.purchased || events.some((e) => e.name === "purchase");

  // Skip near-instant single-page bounces (bots, prefetches) — not worth storing.
  if (!existing && durationMs < 3000 && pages.length <= 1 && maxScrollPct < 10) {
    return NextResponse.json({ ok: true });
  }

  const utm = body.utm ?? {};
  const referrer = existing?.referrer ?? str(body.referrer, 500);
  const row = {
    session_id: sessionId,
    visitor_id: str(body.visitorId, 64),
    visit_number: Number(body.visitNumber) || 1,
    is_new_visitor: (Number(body.visitNumber) || 1) === 1,
    first_seen_at: body.firstSeenAt ? new Date(body.firstSeenAt).toISOString() : null,
    started_at: new Date(startedAt).toISOString(),
    ended_at: new Date(endedAt).toISOString(),
    duration_ms: durationMs,
    pages,
    page_count: pages.length,
    landing_page: existing?.landing_page ?? str(body.landingUrl) ?? pages[0].path,
    exit_page: pages[pages.length - 1].path,
    max_scroll_pct: maxScrollPct,
    referrer,
    referrer_host: referrerHost(referrer),
    utm_source: existing?.utm_source ?? str(utm.source),
    utm_medium: existing?.utm_medium ?? str(utm.medium),
    utm_campaign: existing?.utm_campaign ?? str(utm.campaign),
    utm_term: existing?.utm_term ?? str(utm.term),
    utm_content: existing?.utm_content ?? str(utm.content),
    events,
    event_count: events.length,
    reached_checkout: reachedCheckout,
    purchased,
    device_type: ctx.deviceType,
    browser: ctx.browser,
    os: ctx.os,
    screen: str(body.screen, 20),
    viewport: str(body.viewport, 20),
    language: str(body.language, 20),
    timezone: str(body.timezone, 60),
    connection: str(body.connection, 20),
    touch: !!body.touch,
    country: ctx.country ?? existing?.country ?? null,
    region: ctx.region ?? existing?.region ?? null,
    city: ctx.city ?? existing?.city ?? null,
    user_agent: str(ctx.userAgent, 500),
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    await docRef?.set(row, { merge: true });
  } catch (err) {
    console.error("Failed to save analytics session:", err);
  }

  // Notify once per session, plus once more if a returning snapshot reveals an abandoned checkout.
  const newlyAbandoned = reachedCheckout && !purchased && !existing?.reached_checkout;
  if (existing && !newlyAbandoned) return NextResponse.json({ ok: true });

  const pathChain = pages.map((p) => esc(p.path)).join(" → ");
  const perPage = pages
    .slice(0, 12)
    .map((p) => {
      const t = p.exitedAt ? formatDuration(p.exitedAt - p.enteredAt) : "?";
      return `  • ${esc(p.path)} — ${t}, ${p.maxScrollPct}% scrolled`;
    })
    .join("\n");

  const counts = new Map<string, number>();
  for (const e of events) {
    const label = e.name === "click" || e.name === "outbound_click"
      ? `${e.name === "outbound_click" ? "↗ " : ""}${e.props?.label ?? "?"}`
      : e.name;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const eventLines = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, n]) => `  • ${esc(label)}${n > 1 ? ` ×${n}` : ""}`)
    .join("\n");

  const location = [row.city, row.region, row.country].filter(Boolean).join(", ");
  const utmText = [row.utm_source, row.utm_medium, row.utm_campaign].filter(Boolean).join(" / ");
  const headline = reachedCheckout && !purchased
    ? "⚠️ <b>Checkout abandoned</b>"
    : purchased
      ? "💰 <b>Visitor session (purchased)</b>"
      : "👀 <b>Visitor session</b>";

  const lines = [
    headline,
    "",
    `⏱ Duration: <b>${formatDuration(durationMs)}</b>`,
    `📄 Pages (${pages.length}): ${pathChain}`,
    perPage,
    `🖱 Max scroll: ${maxScrollPct}%`,
    "",
    `🧑 ${row.is_new_visitor ? "New visitor" : `Returning visitor (visit #${row.visit_number})`}`,
    `📍 ${location ? `${countryFlag(row.country)} ${esc(location)}` : "Location unknown"}`,
    `📱 ${esc(row.device_type)} · ${esc(row.os)} · ${esc(row.browser)}${row.screen ? ` · ${esc(row.screen)}` : ""}`,
    row.language || row.timezone ? `🌐 ${esc([row.language, row.timezone].filter(Boolean).join(" · "))}` : null,
    `🔗 Source: ${row.referrer_host ? esc(row.referrer_host) : "Direct"}${utmText ? ` (utm: ${esc(utmText)})` : ""}`,
    `🛬 Landing: ${esc(row.landing_page)}`,
    reachedCheckout ? `🛒 Reached checkout: yes · Purchased: ${purchased ? "yes" : "no"}` : null,
    eventLines ? `\n🎯 Actions (${events.length}):\n${eventLines}` : null,
  ].filter((l) => l !== null);

  await notifyTelegram(lines.join("\n"));

  return NextResponse.json({ ok: true });
}
