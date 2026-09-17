import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { isAnalyticsAuthed } from "@/lib/analyticsServer";
import { computeStats } from "@/lib/analyticsStats";
import type { AnalyticsSession, EmailSubscriber, Order } from "@/lib/types";
import AnalyticsClient, { type RangeKey, type RecentSession } from "./AnalyticsClient";

export const dynamic = "force-dynamic";

const RANGES: Record<RangeKey, number | null> = { "1": 1, "7": 7, "30": 30, "90": 90, all: null };
const PAGE_SIZE = 1000;
const MAX_ROWS = 50_000;

// Supabase caps a single select at 1000 rows, so page through.
async function fetchAll<T>(table: string, columns: string, since: string | null, until: string | null = null) {
  const db = supabaseAdmin();
  const dateCol = table === "analytics_sessions" ? "started_at" : "created_at";
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    let q = db.from(table).select(columns).order(dateCol, { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (since) q = q.gte(dateCol, since);
    if (until) q = q.lt(dateCol, until);
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
  if (!(await isAnalyticsAuthed())) redirect("/admin/analytics/login");

  const { range: rawRange } = await searchParams;
  const range: RangeKey = rawRange && rawRange in RANGES ? (rawRange as RangeKey) : "30";
  const days = RANGES[range];
  const now = Date.now();
  const since = days ? new Date(now - days * 86_400_000).toISOString() : null;
  const prevSince = days ? new Date(now - 2 * days * 86_400_000).toISOString() : null;

  const [sessionsRes, ordersRes, subsRes, prevSessionsRes, prevOrdersRes] = await Promise.all([
    fetchAll<AnalyticsSession>("analytics_sessions", "*", since),
    fetchAll<Order>("orders", "*", since),
    fetchAll<EmailSubscriber>("email_subscribers", "*", since),
    days
      ? supabaseAdmin().from("analytics_sessions").select("id", { count: "exact", head: true }).gte("started_at", prevSince!).lt("started_at", since!)
      : Promise.resolve(null),
    days ? fetchAll<Order>("orders", "total, status", prevSince, since) : Promise.resolve(null),
  ]);

  const previous =
    prevSessionsRes && prevOrdersRes && !prevSessionsRes.error && !prevOrdersRes.error
      ? {
          sessions: prevSessionsRes.count ?? 0,
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
    sessionsRes.error && `Analytics sessions: ${sessionsRes.error}`,
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
