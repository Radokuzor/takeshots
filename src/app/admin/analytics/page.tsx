import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import type { Query } from "firebase-admin/firestore";
import { ANALYTICS_COLLECTION, adminDb } from "@/lib/firebaseAdmin";
import { computeStats } from "@/lib/analyticsStats";
import type { AnalyticsSession, EmailSubscriber, Order } from "@/lib/types";
import AnalyticsClient, { type RangeKey, type RecentSession } from "./AnalyticsClient";

export const dynamic = "force-dynamic";

const RANGES: Record<RangeKey, number | null> = { "1": 1, "7": 7, "30": 30, "90": 90, all: null };
const PAGE_SIZE = 1000;
const MAX_ROWS = 20_000;

/** Sessions live in Firestore; orders and subscribers stay in Supabase. */
async function fetchSessions(since: string | null, until: string | null = null) {
  try {
    let q = adminDb()
      .collection(ANALYTICS_COLLECTION)
      .orderBy("started_at", "desc")
      .limit(MAX_ROWS) as Query;
    if (since) q = q.where("started_at", ">=", since);
    if (until) q = q.where("started_at", "<", until);
    const snap = await q.get();
    return { rows: snap.docs.map((d) => d.data() as AnalyticsSession), error: null as string | null };
  } catch (err) {
    return { rows: [] as AnalyticsSession[], error: (err as Error).message };
  }
}

async function countSessions(since: string, until: string) {
  try {
    const snap = await adminDb()
      .collection(ANALYTICS_COLLECTION)
      .where("started_at", ">=", since)
      .where("started_at", "<", until)
      .count()
      .get();
    return snap.data().count;
  } catch {
    return null;
  }
}

// Supabase caps a single select at 1000 rows, so page through.
async function fetchSupabase<T>(table: string, columns: string, since: string | null, until: string | null = null) {
  const db = supabaseAdmin();
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    let q = db.from(table).select(columns).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (since) q = q.gte("created_at", since);
    if (until) q = q.lt("created_at", until);
    const { data, error } = await q;
    if (error) return { rows, error: error.message };
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { rows, error: null as string | null };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  // Same gate as the orders dashboard — /admin is already password-protected.
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") redirect("/admin/login");

  const { range: rawRange } = await searchParams;
  const range: RangeKey = rawRange && rawRange in RANGES ? (rawRange as RangeKey) : "30";
  const days = RANGES[range];
  const now = Date.now();
  const since = days ? new Date(now - days * 86_400_000).toISOString() : null;
  const prevSince = days ? new Date(now - 2 * days * 86_400_000).toISOString() : null;

  const [sessionsRes, ordersRes, subsRes, prevSessionCount, prevOrdersRes] = await Promise.all([
    fetchSessions(since),
    fetchSupabase<Order>("orders", "*", since),
    fetchSupabase<EmailSubscriber>("email_subscribers", "*", since),
    days ? countSessions(prevSince!, since!) : Promise.resolve(null),
    days ? fetchSupabase<Order>("orders", "total, status", prevSince, since) : Promise.resolve(null),
  ]);

  const previous =
    prevSessionCount !== null && prevOrdersRes && !prevOrdersRes.error
      ? {
          sessions: prevSessionCount,
          orders: prevOrdersRes.rows.filter((o) => o.status !== "cancelled").length,
          revenue: prevOrdersRes.rows
            .filter((o) => o.status !== "cancelled")
            .reduce((n, o) => n + Number(o.total), 0),
        }
      : null;

  const sessions = sessionsRes.rows;
  const orders = ordersRes.rows;
  const stats = computeStats(sessions, orders, subsRes.rows, previous);

  // Raw timestamps are bucketed client-side so days/hours use the viewer's timezone.
  const series = {
    sessions: sessions.map((s) => Date.parse(s.started_at)),
    visitors: sessions.map((s) => [Date.parse(s.started_at), s.visitor_id ?? s.session_id] as [number, string]),
    orders: orders
      .filter((o) => o.status !== "cancelled")
      .map((o) => [Date.parse(o.created_at), Number(o.total)] as [number, number]),
    signups: subsRes.rows.map((s) => Date.parse(s.created_at)),
  };

  const recent: RecentSession[] = sessions.slice(0, 75).map((s) => ({
    id: s.session_id,
    visitorId: s.visitor_id,
    visitNumber: s.visit_number,
    startedAt: s.started_at,
    durationMs: s.duration_ms,
    pages: (s.pages ?? []).map((p) => ({
      path: p.path,
      ms: p.exitedAt ? p.exitedAt - p.enteredAt : null,
      scroll: p.maxScrollPct,
    })),
    events: (s.events ?? []).slice(0, 60).map((e) => ({
      name: e.name,
      path: e.path,
      at: e.at,
      label: e.props?.label ? String(e.props.label) : null,
    })),
    maxScroll: s.max_scroll_pct,
    referrer: s.referrer,
    utm: [s.utm_source, s.utm_medium, s.utm_campaign, s.utm_term, s.utm_content].filter(Boolean).join(" / ") || null,
    landing: s.landing_page,
    device: [s.device_type, s.os, s.browser].filter(Boolean).join(" · "),
    screen: s.screen,
    viewport: s.viewport,
    language: s.language,
    timezone: s.timezone,
    connection: s.connection,
    location: [s.city, s.region, s.country].filter(Boolean).join(", ") || null,
    country: s.country,
    reachedCheckout: s.reached_checkout,
    purchased: s.purchased,
    userAgent: s.user_agent,
  }));

  const errors = [
    sessionsRes.error && `Visitor sessions (Firestore): ${sessionsRes.error}`,
    ordersRes.error && `Orders: ${ordersRes.error}`,
    subsRes.error && `Email subscribers: ${subsRes.error}`,
  ].filter(Boolean) as string[];

  return (
    <AnalyticsClient
      range={range}
      stats={stats}
      series={series}
      recent={recent}
      errors={errors}
      truncated={sessions.length >= MAX_ROWS}
      generatedAt={now}
      rangeStart={since ? Date.parse(since) : null}
    />
  );
}
