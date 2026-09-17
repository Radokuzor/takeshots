import type { AnalyticsSession, EmailSubscriber, Order } from "./types";

export interface Row {
  label: string;
  value: number;
  /** Optional secondary figure shown next to the value (e.g. a percentage). */
  sub?: string;
}

export interface PageRow {
  path: string;
  views: number;
  sessions: number;
  avgTimeMs: number;
  avgScroll: number;
  entries: number;
  exits: number;
}

export interface Totals {
  sessions: number;
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
  pageviews: number;
  avgDurationMs: number;
  medianDurationMs: number;
  totalTimeMs: number;
  pagesPerSession: number;
  avgScroll: number;
  bounceRate: number;
  checkoutSessions: number;
  purchasedSessions: number;
  buyClicks: number;
  orders: number;
  revenue: number;
  aov: number;
  units: number;
  conversionRate: number;
  revenuePerVisitor: number;
  signups: number;
  signupRate: number;
  gamesCreated: number;
  gamesJoined: number;
  repeatCustomers: number;
}

export interface DashboardStats {
  totals: Totals;
  previous: { sessions: number; orders: number; revenue: number } | null;
  funnel: Row[];
  pages: PageRow[];
  landing: Row[];
  exits: Row[];
  referrers: Row[];
  utmSources: Row[];
  utmMediums: Row[];
  utmCampaigns: Row[];
  countries: Row[];
  regions: Row[];
  cities: Row[];
  devices: Row[];
  browsers: Row[];
  os: Row[];
  screens: Row[];
  languages: Row[];
  timezones: Row[];
  connections: Row[];
  visitFrequency: Row[];
  events: Row[];
  clicks: Row[];
  outbound: Row[];
  durationBuckets: Row[];
  scrollBuckets: Row[];
  pageDepth: Row[];
  signupSources: Row[];
  orderStatus: Row[];
  orderStates: Row[];
  orderCountries: Row[];
  sourceConversion: Row[];
}

const MAX_PAGE_TIME = 30 * 60 * 1000; // cap outliers (tab left open)

function pct(n: number, d: number) {
  return d > 0 ? (n / d) * 100 : 0;
}

export function fmtPct(n: number, d: number) {
  return `${pct(n, d).toFixed(pct(n, d) < 10 && pct(n, d) > 0 ? 1 : 0)}%`;
}

function tally(values: (string | null | undefined)[], limit = 12, withShare = true): Row[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = v && v.trim() ? v.trim() : "(none)";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const total = values.length;
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const rows = sorted.slice(0, limit).map(([label, value]) => ({
    label,
    value,
    sub: withShare ? fmtPct(value, total) : undefined,
  }));
  const rest = sorted.slice(limit).reduce((n, [, v]) => n + v, 0);
  if (rest > 0) rows.push({ label: "Other", value: rest, sub: withShare ? fmtPct(rest, total) : undefined });
  return rows;
}

function bucket(values: number[], edges: { label: string; max: number }[]): Row[] {
  const rows = edges.map((e) => ({ label: e.label, value: 0, sub: "" }));
  for (const v of values) {
    const i = edges.findIndex((e) => v <= e.max);
    rows[i === -1 ? rows.length - 1 : i].value++;
  }
  for (const r of rows) r.sub = fmtPct(r.value, values.length);
  return rows;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const isEngaged = (s: AnalyticsSession) =>
  s.page_count > 1 || s.duration_ms >= 10_000 || s.reached_checkout || s.purchased;

export function computeStats(
  sessions: AnalyticsSession[],
  orders: Order[],
  subscribers: EmailSubscriber[],
  previous: DashboardStats["previous"]
): DashboardStats {
  const liveOrders = orders.filter((o) => o.status !== "cancelled");
  const revenue = liveOrders.reduce((n, o) => n + Number(o.total), 0);
  const units = liveOrders.reduce(
    (n, o) => n + (o.items ?? []).reduce((m, i) => m + (Number(i.quantity) || 0), 0),
    0
  );

  const visitorIds = new Set(sessions.map((s) => s.visitor_id ?? s.session_id));
  const newVisitorIds = new Set(sessions.filter((s) => s.is_new_visitor).map((s) => s.visitor_id ?? s.session_id));
  const returningIds = new Set(
    sessions.filter((s) => s.visit_number > 1).map((s) => s.visitor_id ?? s.session_id)
  );

  const allEvents = sessions.flatMap((s) => s.events ?? []);
  const countEvent = (name: string) => allEvents.filter((e) => e.name === name).length;
  const sessionsWithEvent = (name: string) =>
    sessions.filter((s) => (s.events ?? []).some((e) => e.name === name)).length;

  const durations = sessions.map((s) => s.duration_ms);
  const pageviews = sessions.reduce((n, s) => n + s.page_count, 0);
  const totalTimeMs = durations.reduce((a, b) => a + b, 0);
  const purchasedSessions = sessions.filter((s) => s.purchased).length;
  const checkoutSessions = sessions.filter((s) => s.reached_checkout).length;

  const emailCounts = new Map<string, number>();
  for (const o of liveOrders) emailCounts.set(o.customer_email, (emailCounts.get(o.customer_email) ?? 0) + 1);

  const totals: Totals = {
    sessions: sessions.length,
    visitors: visitorIds.size,
    newVisitors: newVisitorIds.size,
    returningVisitors: returningIds.size,
    pageviews,
    avgDurationMs: sessions.length ? totalTimeMs / sessions.length : 0,
    medianDurationMs: median(durations),
    totalTimeMs,
    pagesPerSession: sessions.length ? pageviews / sessions.length : 0,
    avgScroll: sessions.length ? sessions.reduce((n, s) => n + s.max_scroll_pct, 0) / sessions.length : 0,
    bounceRate: pct(sessions.filter((s) => !isEngaged(s)).length, sessions.length),
    checkoutSessions,
    purchasedSessions,
    buyClicks: countEvent("buy_now_click"),
    orders: liveOrders.length,
    revenue,
    aov: liveOrders.length ? revenue / liveOrders.length : 0,
    units,
    conversionRate: pct(purchasedSessions, sessions.length),
    revenuePerVisitor: visitorIds.size ? revenue / visitorIds.size : 0,
    signups: subscribers.length,
    signupRate: pct(subscribers.length, visitorIds.size),
    gamesCreated: countEvent("game_created"),
    gamesJoined: countEvent("game_joined"),
    repeatCustomers: [...emailCounts.values()].filter((n) => n > 1).length,
  };

  // Funnel — each step counts sessions.
  const viewedHome = sessions.filter((s) => (s.pages ?? []).some((p) => p.path === "/")).length;
  const clickedBuy = sessionsWithEvent("buy_now_click");
  const funnelSteps: [string, number][] = [
    ["All sessions", sessions.length],
    ["Viewed homepage", viewedHome],
    ["Clicked Buy Now", clickedBuy],
    ["Reached checkout", checkoutSessions],
    ["Purchased", purchasedSessions],
  ];
  const funnel = funnelSteps.map(([label, value], i) => ({
    label,
    value,
    sub: i === 0 ? "100%" : `${fmtPct(value, sessions.length)} · ${fmtPct(value, funnelSteps[i - 1][1])} of prev`,
  }));

  // Per-page stats
  const pageMap = new Map<string, PageRow & { timeSamples: number; sessionIds: Set<string> }>();
  for (const s of sessions) {
    const ps = s.pages ?? [];
    ps.forEach((p, i) => {
      let row = pageMap.get(p.path);
      if (!row) {
        row = { path: p.path, views: 0, sessions: 0, avgTimeMs: 0, avgScroll: 0, entries: 0, exits: 0, timeSamples: 0, sessionIds: new Set() };
        pageMap.set(p.path, row);
      }
      row.views++;
      row.sessionIds.add(s.session_id);
      if (p.exitedAt) {
        row.avgTimeMs += Math.min(MAX_PAGE_TIME, Math.max(0, p.exitedAt - p.enteredAt));
        row.timeSamples++;
      }
      row.avgScroll += p.maxScrollPct ?? 0;
      if (i === 0) row.entries++;
      if (i === ps.length - 1) row.exits++;
    });
  }
  const pages: PageRow[] = [...pageMap.values()]
    .map(({ timeSamples, sessionIds, ...r }) => ({
      ...r,
      sessions: sessionIds.size,
      avgTimeMs: timeSamples ? r.avgTimeMs / timeSamples : 0,
      avgScroll: r.views ? r.avgScroll / r.views : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 25);

  // Conversion by traffic source
  const bySource = new Map<string, { sessions: number; purchased: number }>();
  for (const s of sessions) {
    const key = s.utm_source ?? s.referrer_host ?? "Direct";
    const r = bySource.get(key) ?? { sessions: 0, purchased: 0 };
    r.sessions++;
    if (s.purchased) r.purchased++;
    bySource.set(key, r);
  }
  const sourceConversion = [...bySource.entries()]
    .sort((a, b) => b[1].sessions - a[1].sessions)
    .slice(0, 12)
    .map(([label, r]) => ({ label, value: r.purchased, sub: `${r.sessions} sessions · ${fmtPct(r.purchased, r.sessions)}` }));

  const clickEvents = allEvents.filter((e) => e.name === "click");
  const outboundEvents = allEvents.filter((e) => e.name === "outbound_click");

  return {
    totals,
    previous,
    funnel,
    pages,
    landing: tally(sessions.map((s) => (s.landing_page ?? "").split("?")[0] || null)),
    exits: tally(sessions.map((s) => s.exit_page)),
    referrers: tally(sessions.map((s) => s.referrer_host ?? "Direct")),
    utmSources: tally(sessions.filter((s) => s.utm_source).map((s) => s.utm_source)),
    utmMediums: tally(sessions.filter((s) => s.utm_medium).map((s) => s.utm_medium)),
    utmCampaigns: tally(sessions.filter((s) => s.utm_campaign).map((s) => s.utm_campaign)),
    countries: tally(sessions.map((s) => s.country)),
    regions: tally(sessions.map((s) => (s.region ? `${s.region}, ${s.country ?? "?"}` : null))),
    cities: tally(sessions.map((s) => (s.city ? `${s.city}, ${s.region ?? s.country ?? ""}` : null))),
    devices: tally(sessions.map((s) => s.device_type)),
    browsers: tally(sessions.map((s) => s.browser)),
    os: tally(sessions.map((s) => s.os)),
    screens: tally(sessions.map((s) => s.screen), 10),
    languages: tally(sessions.map((s) => s.language), 10),
    timezones: tally(sessions.map((s) => s.timezone), 10),
    connections: tally(sessions.map((s) => s.connection), 6),
    visitFrequency: bucket(
      sessions.map((s) => s.visit_number),
      [
        { label: "1st visit", max: 1 },
        { label: "2nd visit", max: 2 },
        { label: "3rd–5th", max: 5 },
        { label: "6th–10th", max: 10 },
        { label: "11+", max: Infinity },
      ]
    ),
    events: tally(allEvents.filter((e) => e.name !== "click" && e.name !== "outbound_click").map((e) => e.name), 15, false),
    clicks: tally(clickEvents.map((e) => `${e.props?.label ?? "?"}  ·  ${e.path}`), 20, false),
    outbound: tally(outboundEvents.map((e) => String(e.props?.href ?? e.props?.label ?? "?")), 12, false),
    durationBuckets: bucket(durations, [
      { label: "< 10s", max: 10_000 },
      { label: "10–30s", max: 30_000 },
      { label: "30s–1m", max: 60_000 },
      { label: "1–3m", max: 180_000 },
      { label: "3–10m", max: 600_000 },
      { label: "10m+", max: Infinity },
    ]),
    scrollBuckets: bucket(
      sessions.map((s) => s.max_scroll_pct),
      [
        { label: "0–24%", max: 24 },
        { label: "25–49%", max: 49 },
        { label: "50–74%", max: 74 },
        { label: "75–99%", max: 99 },
        { label: "100%", max: 100 },
      ]
    ),
    pageDepth: bucket(
      sessions.map((s) => s.page_count),
      [
        { label: "1 page", max: 1 },
        { label: "2 pages", max: 2 },
        { label: "3–4 pages", max: 4 },
        { label: "5+ pages", max: Infinity },
      ]
    ),
    signupSources: tally(subscribers.map((s) => s.source)),
    orderStatus: tally(orders.map((o) => o.status)),
    orderStates: tally(orders.map((o) => o.shipping?.state ?? null)),
    orderCountries: tally(orders.map((o) => o.shipping?.country ?? null)),
    sourceConversion,
  };
}
