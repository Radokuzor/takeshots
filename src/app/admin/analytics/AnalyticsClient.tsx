"use client";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import type { DashboardStats, PageRow, Row } from "@/lib/analyticsStats";

export type RangeKey = "1" | "7" | "30" | "90" | "all";

export interface RecentSession {
  id: string;
  visitorId: string | null;
  visitNumber: number;
  startedAt: string;
  durationMs: number;
  pages: { path: string; ms: number | null; scroll: number }[];
  events: { name: string; path: string; at: number; label: string | null }[];
  maxScroll: number;
  referrer: string | null;
  utm: string | null;
  landing: string | null;
  device: string;
  screen: string | null;
  viewport: string | null;
  language: string | null;
  timezone: string | null;
  connection: string | null;
  location: string | null;
  country: string | null;
  reachedCheckout: boolean;
  purchased: boolean;
  userAgent: string | null;
}

interface Series {
  sessions: number[];
  visitors: [number, string][];
  orders: [number, number][];
  signups: number[];
}

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1", label: "24 hours" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All time" },
];

const BAR = "#FF4500";
const panel = "bg-white rounded-3xl border border-[#1A1A1A]/[0.06] p-5 sm:p-6";

// ── formatting ──────────────────────────────────────────────────────────────

const int = (n: number) => Math.round(n).toLocaleString("en-US");
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const pctText = (n: number) => `${n.toFixed(n > 0 && n < 10 ? 1 : 0)}%`;

function duration(ms: number) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function flag(code: string | null) {
  if (!code || !/^[A-Z]{2}$/i.test(code)) return "";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  const n = v / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

// ── time bucketing (viewer's local timezone) ────────────────────────────────

type Granularity = "hour" | "day" | "month";

function startOf(t: number, g: Granularity) {
  const d = new Date(t);
  if (g === "hour") d.setMinutes(0, 0, 0);
  else if (g === "day") d.setHours(0, 0, 0, 0);
  else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d.getTime();
}

function step(t: number, g: Granularity) {
  const d = new Date(t);
  if (g === "hour") d.setHours(d.getHours() + 1);
  else if (g === "day") d.setDate(d.getDate() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

function bucketLabel(t: number, g: Granularity) {
  const d = new Date(t);
  if (g === "hour") return d.toLocaleTimeString("en-US", { hour: "numeric" });
  if (g === "day") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function useBuckets(series: Series, range: RangeKey, rangeStart: number | null, now: number) {
  return useMemo(() => {
    const all = [...series.sessions, ...series.orders.map((o) => o[0]), ...series.signups];
    const earliest = rangeStart ?? (all.length ? Math.min(...all) : now);
    const g: Granularity = range === "1" ? "hour" : now - earliest > 120 * 86_400_000 ? "month" : "day";

    const keys: number[] = [];
    for (let t = startOf(earliest, g); t <= now; t = step(t, g)) keys.push(t);
    const index = new Map(keys.map((k, i) => [k, i]));
    const blank = () => keys.map(() => 0);

    const sessions = blank();
    const orders = blank();
    const revenue = blank();
    const signups = blank();
    const visitorSets = keys.map(() => new Set<string>());
    const put = (t: number) => index.get(startOf(t, g));

    for (const t of series.sessions) {
      const i = put(t);
      if (i !== undefined) sessions[i]++;
    }
    for (const [t, v] of series.visitors) {
      const i = put(t);
      if (i !== undefined) visitorSets[i].add(v);
    }
    for (const [t, total] of series.orders) {
      const i = put(t);
      if (i !== undefined) {
        orders[i]++;
        revenue[i] += total;
      }
    }
    for (const t of series.signups) {
      const i = put(t);
      if (i !== undefined) signups[i]++;
    }

    const hours = Array.from({ length: 24 }, () => 0);
    const weekdays = Array.from({ length: 7 }, () => 0);
    for (const t of series.sessions) {
      const d = new Date(t);
      hours[d.getHours()]++;
      weekdays[d.getDay()]++;
    }

    const label = (i: number) => bucketLabel(keys[i], g);
    return {
      granularity: g,
      sessions: keys.map((_, i) => ({ label: label(i), value: sessions[i] })),
      visitors: keys.map((_, i) => ({ label: label(i), value: visitorSets[i].size })),
      orders: keys.map((_, i) => ({ label: label(i), value: orders[i] })),
      revenue: keys.map((_, i) => ({ label: label(i), value: revenue[i] })),
      signups: keys.map((_, i) => ({ label: label(i), value: signups[i] })),
      hours: hours.map((value, h) => ({
        label: new Date(2000, 0, 1, h).toLocaleTimeString("en-US", { hour: "numeric" }),
        value,
      })),
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, i) => ({ label, value: weekdays[i] })),
    };
  }, [series, range, rangeStart, now]);
}

// ── building blocks ─────────────────────────────────────────────────────────

function Panel({ title, hint, children, className = "" }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${panel} ${className}`}>
      <header className="mb-4">
        <h2 className="font-black uppercase tracking-tight text-sm">{title}</h2>
        {hint && <p className="text-xs text-[#1A1A1A]/50 mt-0.5">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

function Delta({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined) return null;
  if (previous === 0) {
    return current > 0 ? <span className="text-xs text-[#1A1A1A]/50">new vs prev. period</span> : null;
  }
  const change = ((current - previous) / previous) * 100;
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? "text-green-700" : "text-red-600"}`}>
      <Icon size={13} aria-hidden />
      {up ? "+" : ""}
      {change.toFixed(0)}% <span className="font-normal text-[#1A1A1A]/50 ml-1">vs prev.</span>
    </span>
  );
}

function Stat({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#1A1A1A]/[0.06] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">{label}</p>
      <p className="font-black text-2xl sm:text-[1.7rem] leading-tight mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#1A1A1A]/55 mt-0.5">{sub}</p>}
      {delta && <div className="mt-1">{delta}</div>}
    </div>
  );
}

function BarChart({
  data,
  format = int,
  height = 170,
  name,
}: {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
  height?: number;
  name: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const every = Math.max(1, Math.ceil(data.length / 8));
  const total = data.reduce((n, d) => n + d.value, 0);

  if (data.length === 0) return <Empty />;

  return (
    <div>
      <div className="flex gap-2">
        {/* y-axis */}
        <div className="flex flex-col justify-between text-[10px] text-[#1A1A1A]/45 tabular-nums text-right w-10 shrink-0" style={{ height }}>
          <span>{format(max)}</span>
          <span>{format(max / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative flex-1 min-w-0" style={{ height }} onPointerLeave={() => setActive(null)}>
          {/* gridlines */}
          {[0, 0.5, 1].map((f) => (
            <div key={f} className="absolute left-0 right-0 border-t border-[#1A1A1A]/[0.07]" style={{ top: `${f * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" role="list" aria-label={name}>
            {data.map((d, i) => {
              const h = (d.value / max) * 100;
              return (
                <div
                  key={i}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${d.label}: ${format(d.value)}`}
                  className="relative flex-1 h-full flex items-end outline-none focus-visible:bg-[#1A1A1A]/[0.04] cursor-default"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <div
                    className="w-full rounded-t-[4px] transition-opacity"
                    style={{
                      height: d.value > 0 ? `max(${h}%, 2px)` : 0,
                      background: BAR,
                      opacity: active === null || active === i ? 1 : 0.45,
                    }}
                  />
                </div>
              );
            })}
          </div>
          {active !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 rounded-lg bg-[#1A1A1A] px-2.5 py-1.5 text-white shadow-lg whitespace-nowrap"
              style={{
                left: `${((active + 0.5) / data.length) * 100}%`,
                transform: `translate(${active / data.length > 0.7 ? "-100%" : active / data.length < 0.3 ? "0" : "-50%"}, -100%)`,
              }}
            >
              <p className="font-black text-sm tabular-nums">{format(data[active].value)}</p>
              <p className="text-[11px] text-white/70">{data[active].label}</p>
            </div>
          )}
        </div>
      </div>
      {/* x-axis */}
      <div className="flex gap-[2px] ml-12 mt-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 min-w-0 text-[10px] text-[#1A1A1A]/45 text-center overflow-visible whitespace-nowrap">
            {i % every === 0 ? d.label : ""}
          </div>
        ))}
      </div>
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-[#1A1A1A]/50 hover:text-[#1A1A1A]">
          View as table · total {format(total)}
        </summary>
        <div className="max-h-48 overflow-auto mt-2">
          <table className="w-full tabular-nums">
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-t border-[#1A1A1A]/[0.06]">
                  <td className="py-1 text-[#1A1A1A]/70">{d.label}</td>
                  <td className="py-1 text-right font-semibold">{format(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function Empty({ text = "No data yet for this range." }: { text?: string }) {
  return <p className="text-sm text-[#1A1A1A]/45 py-6 text-center">{text}</p>;
}

function RankList({ rows, format = int, limit = 12 }: { rows: Row[]; format?: (n: number) => string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (rows.length === 0) return <Empty />;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const shown = expanded ? rows : rows.slice(0, limit);
  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {shown.map((r) => (
          <li key={r.label} title={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-[#1A1A1A]/80">{r.label}</span>
              <span className="shrink-0 tabular-nums">
                <b>{format(r.value)}</b>
                {r.sub && <span className="text-[#1A1A1A]/45 text-xs ml-1.5">{r.sub}</span>}
              </span>
            </div>
            <div className="h-1 mt-1 rounded-full bg-[#1A1A1A]/[0.05]">
              <div className="h-1 rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: BAR }} />
            </div>
          </li>
        ))}
      </ul>
      {rows.length > limit && (
        <button onClick={() => setExpanded((e) => !e)} className="mt-3 text-xs font-bold text-[#FF4500]">
          {expanded ? "Show less" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}

function PagesTable({ pages }: { pages: PageRow[] }) {
  if (pages.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm tabular-nums min-w-[560px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-[#1A1A1A]/50">
            <th className="py-2 px-1 font-bold">Page</th>
            <th className="py-2 px-1 font-bold text-right">Views</th>
            <th className="py-2 px-1 font-bold text-right">Sessions</th>
            <th className="py-2 px-1 font-bold text-right">Avg time</th>
            <th className="py-2 px-1 font-bold text-right">Avg scroll</th>
            <th className="py-2 px-1 font-bold text-right">Entries</th>
            <th className="py-2 px-1 font-bold text-right">Exits</th>
            <th className="py-2 px-1 font-bold text-right">Exit rate</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.path} className="border-t border-[#1A1A1A]/[0.06]">
              <td className="py-2 px-1 font-semibold max-w-[220px] truncate" title={p.path}>{p.path}</td>
              <td className="py-2 px-1 text-right">{int(p.views)}</td>
              <td className="py-2 px-1 text-right">{int(p.sessions)}</td>
              <td className="py-2 px-1 text-right">{duration(p.avgTimeMs)}</td>
              <td className="py-2 px-1 text-right">{pctText(p.avgScroll)}</td>
              <td className="py-2 px-1 text-right">{int(p.entries)}</td>
              <td className="py-2 px-1 text-right">{int(p.exits)}</td>
              <td className="py-2 px-1 text-right">{pctText(p.views ? (p.exits / p.views) * 100 : 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Funnel({ rows }: { rows: Row[] }) {
  const top = Math.max(1, rows[0]?.value ?? 0);
  return (
    <ol className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">
              <span className="text-[#1A1A1A]/40 mr-2">{i + 1}</span>
              {r.label}
            </span>
            <span className="tabular-nums">
              <b>{int(r.value)}</b>
              <span className="text-xs text-[#1A1A1A]/45 ml-1.5">{r.sub}</span>
            </span>
          </div>
          <div className="h-3 mt-1.5 rounded-full bg-[#1A1A1A]/[0.05]">
            <div className="h-3 rounded-full" style={{ width: `${Math.max(r.value ? 1 : 0, (r.value / top) * 100)}%`, background: BAR }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "coral" | "green" | "red" | "gray" }) {
  const cls = {
    coral: "bg-[#FFF0E8] text-[#C73600]",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-700",
    gray: "bg-[#1A1A1A]/[0.06] text-[#1A1A1A]/70",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>;
}

function SessionsTable({ sessions }: { sessions: RecentSession[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (sessions.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-[#1A1A1A]/50">
            <th className="py-2 px-1 font-bold">When</th>
            <th className="py-2 px-1 font-bold">Visitor</th>
            <th className="py-2 px-1 font-bold">Location</th>
            <th className="py-2 px-1 font-bold">Device</th>
            <th className="py-2 px-1 font-bold">Source</th>
            <th className="py-2 px-1 font-bold text-right">Pages</th>
            <th className="py-2 px-1 font-bold text-right">Time</th>
            <th className="py-2 px-1 font-bold">Outcome</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const isOpen = open === s.id;
            let source = "Direct";
            try {
              if (s.referrer) source = new URL(s.referrer).hostname.replace(/^www\./, "");
            } catch {
              source = s.referrer ?? "Direct";
            }
            return (
              <Fragment key={s.id}>
                <tr
                  className="border-t border-[#1A1A1A]/[0.06] cursor-pointer hover:bg-[#F5F4F0]"
                  onClick={() => setOpen(isOpen ? null : s.id)}
                >
                  <td className="py-2.5 px-1 whitespace-nowrap">
                    {new Date(s.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5 px-1 whitespace-nowrap">
                    {s.visitNumber > 1 ? <Badge tone="gray">Visit #{s.visitNumber}</Badge> : <Badge tone="coral">New</Badge>}
                  </td>
                  <td className="py-2.5 px-1 max-w-[180px] truncate">
                    {s.location ? `${flag(s.country)} ${s.location}` : <span className="text-[#1A1A1A]/40">Unknown</span>}
                  </td>
                  <td className="py-2.5 px-1 whitespace-nowrap capitalize">{s.device}</td>
                  <td className="py-2.5 px-1 max-w-[160px] truncate" title={s.utm ?? source}>
                    {source}
                    {s.utm && <span className="text-[#1A1A1A]/45"> · {s.utm}</span>}
                  </td>
                  <td className="py-2.5 px-1 text-right tabular-nums">{s.pages.length}</td>
                  <td className="py-2.5 px-1 text-right tabular-nums">{duration(s.durationMs)}</td>
                  <td className="py-2.5 px-1 whitespace-nowrap">
                    {s.purchased ? (
                      <Badge tone="green"><ShoppingBag size={11} aria-hidden /> Purchased</Badge>
                    ) : s.reachedCheckout ? (
                      <Badge tone="red"><AlertTriangle size={11} aria-hidden /> Abandoned</Badge>
                    ) : (
                      <span className="text-[#1A1A1A]/40 text-xs">Browsed</span>
                    )}
                  </td>
                  <td className="py-2.5 px-1">
                    <ChevronDown size={16} className={`transition-transform text-[#1A1A1A]/40 ${isOpen ? "rotate-180" : ""}`} />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-[#F5F4F0]">
                    <td colSpan={9} className="p-4">
                      <div className="grid md:grid-cols-3 gap-5 text-xs">
                        <div>
                          <p className="font-black uppercase mb-2">Page journey</p>
                          <ol className="flex flex-col gap-1.5">
                            {s.pages.map((p, i) => (
                              <li key={i} className="flex justify-between gap-2">
                                <span className="truncate font-semibold">{i + 1}. {p.path}</span>
                                <span className="shrink-0 text-[#1A1A1A]/55 tabular-nums">
                                  {p.ms !== null ? duration(p.ms) : "?"} · {p.scroll}%
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="font-black uppercase mb-2">Actions ({s.events.length})</p>
                          {s.events.length === 0 ? (
                            <p className="text-[#1A1A1A]/45">No clicks or events recorded.</p>
                          ) : (
                            <ol className="flex flex-col gap-1.5 max-h-56 overflow-auto">
                              {s.events.map((e, i) => (
                                <li key={i} className="flex justify-between gap-2">
                                  <span className="truncate">
                                    <b>{e.name.replace(/_/g, " ")}</b>
                                    {e.label && <> · {e.label}</>}
                                    <span className="text-[#1A1A1A]/45"> on {e.path}</span>
                                  </span>
                                  <span className="shrink-0 text-[#1A1A1A]/45 tabular-nums">
                                    +{duration(Math.max(0, e.at - Date.parse(s.startedAt)))}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 content-start">
                          <dt className="text-[#1A1A1A]/50">Landing</dt><dd className="break-all">{s.landing ?? "—"}</dd>
                          <dt className="text-[#1A1A1A]/50">Referrer</dt><dd className="break-all">{s.referrer ?? "Direct"}</dd>
                          <dt className="text-[#1A1A1A]/50">UTM</dt><dd className="break-all">{s.utm ?? "—"}</dd>
                          <dt className="text-[#1A1A1A]/50">Max scroll</dt><dd>{s.maxScroll}%</dd>
                          <dt className="text-[#1A1A1A]/50">Screen</dt><dd>{s.screen ?? "—"} (viewport {s.viewport ?? "—"})</dd>
                          <dt className="text-[#1A1A1A]/50">Language</dt><dd>{s.language ?? "—"}</dd>
                          <dt className="text-[#1A1A1A]/50">Timezone</dt><dd>{s.timezone ?? "—"}</dd>
                          <dt className="text-[#1A1A1A]/50">Network</dt><dd>{s.connection ?? "—"}</dd>
                          <dt className="text-[#1A1A1A]/50">Visitor ID</dt><dd className="break-all">{s.visitorId ?? "—"}</dd>
                          <dt className="text-[#1A1A1A]/50">User agent</dt><dd className="break-all text-[#1A1A1A]/60">{s.userAgent ?? "—"}</dd>
                        </dl>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function AnalyticsClient({
  range,
  stats,
  series,
  recent,
  errors,
  truncated,
  generatedAt,
  rangeStart,
}: {
  range: RangeKey;
  stats: DashboardStats;
  series: Series;
  recent: RecentSession[];
  errors: string[];
  truncated: boolean;
  generatedAt: number;
  rangeStart: number | null;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const b = useBuckets(series, range, rangeStart, generatedAt);
  const t = stats.totals;
  const prev = stats.previous;
  const rangeLabel = RANGE_OPTIONS.find((r) => r.key === range)?.label ?? "";
  const bucketWord = b.granularity === "hour" ? "hour" : b.granularity === "day" ? "day" : "month";

  async function logout() {
    await fetch("/api/admin/analytics-auth", { method: "DELETE" });
    router.push("/admin/analytics/login");
    router.refresh();
  }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  const missingTable = errors.some((e) => e.startsWith("Analytics sessions"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF4500]">TakeShots</p>
          <h1 className="font-black text-3xl sm:text-4xl uppercase tracking-tight">Analytics</h1>
          <p className="text-xs text-[#1A1A1A]/50 mt-1">
            Updated {new Date(generatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            {" · "}times shown in your local timezone
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="btn-ghost !min-h-10 !px-4 !text-sm"><Package size={15} /> Orders</Link>
          <button onClick={refresh} className="btn-ghost !min-h-10 !px-4 !text-sm" aria-label="Refresh">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button onClick={logout} className="btn-ghost !min-h-10 !px-4 !text-sm" aria-label="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* range filter — scopes everything below */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6" role="tablist" aria-label="Date range">
        {RANGE_OPTIONS.map((r) => (
          <Link
            key={r.key}
            href={`/admin/analytics?range=${r.key}`}
            role="tab"
            aria-selected={r.key === range}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border-2 transition-colors ${
              r.key === range
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                : "border-[#1A1A1A]/10 bg-white hover:border-[#1A1A1A]/30"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {errors.length > 0 && (
        <div className={`${panel} mb-6 border-red-200`}>
          <p className="font-bold text-red-600 mb-1 flex items-center gap-2"><AlertTriangle size={16} /> Some data couldn&apos;t be loaded</p>
          <ul className="text-sm text-[#1A1A1A]/70 list-disc pl-5">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
          {missingTable && (
            <p className="text-sm text-[#1A1A1A]/60 mt-2">
              Create the <code>analytics_sessions</code> table by running the new block in <code>supabase/schema.sql</code> in the Supabase SQL editor.
            </p>
          )}
        </div>
      )}
      {truncated && (
        <p className="text-xs text-[#1A1A1A]/60 mb-4">Showing the most recent 50,000 sessions for this range.</p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-3">
        <Stat label="Sessions" value={int(t.sessions)} delta={prev && <Delta current={t.sessions} previous={prev.sessions} />} />
        <Stat label="Unique visitors" value={int(t.visitors)} sub={`${int(t.newVisitors)} new · ${int(t.returningVisitors)} returning`} />
        <Stat label="Pageviews" value={int(t.pageviews)} sub={`${t.pagesPerSession.toFixed(1)} per session`} />
        <Stat label="Avg session" value={duration(t.avgDurationMs)} sub={`median ${duration(t.medianDurationMs)}`} />
        <Stat label="Bounce rate" value={pctText(t.bounceRate)} sub="single page, under 10s" />
        <Stat label="Avg scroll depth" value={pctText(t.avgScroll)} sub={`${duration(t.totalTimeMs)} total time on site`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        <Stat label="Revenue" value={money(t.revenue)} delta={prev && <Delta current={t.revenue} previous={prev.revenue} />} />
        <Stat label="Orders" value={int(t.orders)} sub={`${int(t.units)} units · ${int(t.repeatCustomers)} repeat buyers`} delta={prev && <Delta current={t.orders} previous={prev.orders} />} />
        <Stat label="Avg order value" value={money(t.aov)} sub={`${money(t.revenuePerVisitor)} per visitor`} />
        <Stat label="Conversion rate" value={pctText(t.conversionRate)} sub={`${int(t.purchasedSessions)} purchasing sessions`} />
        <Stat
          label="Checkout reach"
          value={int(t.checkoutSessions)}
          sub={`${int(t.buyClicks)} Buy Now clicks · ${int(Math.max(0, t.checkoutSessions - t.purchasedSessions))} abandoned`}
        />
        <Stat label="Email signups" value={int(t.signups)} sub={`${pctText(t.signupRate)} of visitors · ${int(t.gamesCreated)} games / ${int(t.gamesJoined)} joins`} />
      </div>

      {/* trends */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Panel title="Sessions" hint={`Per ${bucketWord} · ${rangeLabel}`}>
          <BarChart name="Sessions over time" data={b.sessions} />
        </Panel>
        <Panel title="Unique visitors" hint={`Per ${bucketWord}`}>
          <BarChart name="Unique visitors over time" data={b.visitors} />
        </Panel>
        <Panel title="Revenue" hint={`Per ${bucketWord}, excluding cancelled orders`}>
          <BarChart name="Revenue over time" data={b.revenue} format={(n) => `$${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0)}`} />
        </Panel>
        <Panel title="Orders" hint={`Per ${bucketWord}`}>
          <BarChart name="Orders over time" data={b.orders} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Panel title="Purchase funnel" hint="Sessions reaching each step">
          <Funnel rows={stats.funnel} />
        </Panel>
        <Panel title="Busiest hours" hint="Sessions by hour of day">
          <BarChart name="Sessions by hour of day" data={b.hours} height={140} />
        </Panel>
        <Panel title="Busiest days" hint="Sessions by day of week">
          <BarChart name="Sessions by day of week" data={b.weekdays} height={140} />
        </Panel>
      </div>

      <Panel title="Pages" hint="Time is capped at 30 minutes per view to ignore tabs left open" className="mb-4">
        <PagesTable pages={stats.pages} />
      </Panel>

      {/* acquisition */}
      <h2 className="font-black uppercase text-lg mt-8 mb-3">Acquisition</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <Panel title="Referrers"><RankList rows={stats.referrers} /></Panel>
        <Panel title="Purchases by source" hint="Purchasing sessions · sessions · conversion">
          <RankList rows={stats.sourceConversion} />
        </Panel>
        <Panel title="Landing pages"><RankList rows={stats.landing} /></Panel>
        <Panel title="UTM sources"><RankList rows={stats.utmSources} /></Panel>
        <Panel title="UTM mediums"><RankList rows={stats.utmMediums} /></Panel>
        <Panel title="UTM campaigns"><RankList rows={stats.utmCampaigns} /></Panel>
      </div>

      {/* audience */}
      <h2 className="font-black uppercase text-lg mt-8 mb-3">Audience</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <Panel title="Countries"><RankList rows={stats.countries.map((r) => ({ ...r, label: `${flag(r.label)} ${r.label}` }))} /></Panel>
        <Panel title="Regions"><RankList rows={stats.regions} /></Panel>
        <Panel title="Cities"><RankList rows={stats.cities} /></Panel>
        <Panel title="Devices"><RankList rows={stats.devices} /></Panel>
        <Panel title="Operating systems"><RankList rows={stats.os} /></Panel>
        <Panel title="Browsers"><RankList rows={stats.browsers} /></Panel>
        <Panel title="Screen sizes"><RankList rows={stats.screens} /></Panel>
        <Panel title="Languages"><RankList rows={stats.languages} /></Panel>
        <Panel title="Timezones"><RankList rows={stats.timezones} /></Panel>
        <Panel title="Visit frequency" hint="Which visit number each session was"><RankList rows={stats.visitFrequency} /></Panel>
        <Panel title="Network speed"><RankList rows={stats.connections} /></Panel>
      </div>

      {/* engagement */}
      <h2 className="font-black uppercase text-lg mt-8 mb-3">Engagement</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <Panel title="Session length"><RankList rows={stats.durationBuckets} /></Panel>
        <Panel title="Scroll depth" hint="Deepest scroll reached per session"><RankList rows={stats.scrollBuckets} /></Panel>
        <Panel title="Pages per session"><RankList rows={stats.pageDepth} /></Panel>
        <Panel title="Exit pages"><RankList rows={stats.exits} /></Panel>
        <Panel title="Events" hint="Buy Now, signups, purchases, games…"><RankList rows={stats.events} /></Panel>
        <Panel title="Outbound links"><RankList rows={stats.outbound} /></Panel>
        <Panel title="Top clicks" hint="Button / link text · page" className="md:col-span-2 xl:col-span-3">
          <RankList rows={stats.clicks} limit={15} />
        </Panel>
      </div>

      {/* sales & leads */}
      <h2 className="font-black uppercase text-lg mt-8 mb-3">Sales & leads</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <Panel title="Email signups" hint={`Per ${bucketWord}`} className="md:col-span-2">
          <BarChart name="Email signups over time" data={b.signups} height={140} />
        </Panel>
        <Panel title="Signup sources"><RankList rows={stats.signupSources} /></Panel>
        <Panel title="Order status"><RankList rows={stats.orderStatus} /></Panel>
        <Panel title="Orders by state"><RankList rows={stats.orderStates} /></Panel>
        <Panel title="Orders by country"><RankList rows={stats.orderCountries} /></Panel>
      </div>

      {/* sessions */}
      <h2 className="font-black uppercase text-lg mt-8 mb-3">Recent sessions</h2>
      <Panel title={`Latest ${recent.length}`} hint="Click a row for the full journey">
        <SessionsTable sessions={recent} />
      </Panel>
    </div>
  );
}
