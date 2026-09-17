import { createHash } from "crypto";
import { cookies } from "next/headers";

// ── Request context (device + location) ─────────────────────────────────────

export interface ClientContext {
  userAgent: string | null;
  deviceType: "mobile" | "tablet" | "desktop" | "bot";
  browser: string;
  os: string;
  country: string | null;
  region: string | null;
  city: string | null;
}

export function parseUserAgent(ua: string | null) {
  const s = ua ?? "";
  const isBot = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget/i.test(s);

  let browser = "Other";
  if (/Edg\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Instagram/.test(s)) browser = "Instagram in-app";
  else if (/FBAN|FBAV/.test(s)) browser = "Facebook in-app";
  else if (/TikTok|musical_ly|BytedanceWebview/i.test(s)) browser = "TikTok in-app";
  else if (/Snapchat/.test(s)) browser = "Snapchat in-app";
  else if (/CriOS|Chrome\//.test(s)) browser = "Chrome";
  else if (/FxiOS|Firefox\//.test(s)) browser = "Firefox";
  else if (/Safari\//.test(s)) browser = "Safari";

  let os = "Other";
  if (/iPhone|iPod/.test(s)) os = "iOS";
  else if (/iPad/.test(s)) os = "iPadOS";
  else if (/Android/.test(s)) os = "Android";
  else if (/Windows/.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/CrOS/.test(s)) os = "ChromeOS";
  else if (/Linux/.test(s)) os = "Linux";

  let deviceType: ClientContext["deviceType"] = "desktop";
  if (isBot) deviceType = "bot";
  else if (/iPad|Tablet/.test(s) || (/Android/.test(s) && !/Mobile/.test(s))) deviceType = "tablet";
  else if (/Mobi|iPhone|iPod|Android/.test(s)) deviceType = "mobile";

  return { deviceType, browser, os };
}

function decodeHeader(v: string | null) {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** Geo comes from the host's edge headers (Vercel or Cloudflare). Null when neither is present (e.g. local dev). */
export function getClientContext(headers: Headers): ClientContext {
  const userAgent = headers.get("user-agent");
  return {
    userAgent,
    ...parseUserAgent(userAgent),
    country: headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
    region: decodeHeader(headers.get("x-vercel-ip-country-region") ?? headers.get("cf-region")),
    city: decodeHeader(headers.get("x-vercel-ip-city") ?? headers.get("cf-ipcity")),
  };
}

export function referrerHost(referrer: string | null | undefined) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function formatDuration(ms: number) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function countryFlag(code: string | null | undefined) {
  if (!code || !/^[A-Z]{2}$/i.test(code)) return "";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

// ── Analytics dashboard password gate ───────────────────────────────────────
// Separate from ADMIN_PASSWORD. The cookie holds a hash of the password rather
// than a bare "1", so it can't be forged without knowing the password, and
// changing the password logs everyone out.

export const ANALYTICS_COOKIE = "analytics_auth";

export function analyticsPassword() {
  return process.env.ANALYTICS_PASSWORD || "test1234";
}

export function analyticsToken() {
  return createHash("sha256").update(`takeshots-analytics:${analyticsPassword()}`).digest("hex");
}

export async function isAnalyticsAuthed() {
  const cookieStore = await cookies();
  return cookieStore.get(ANALYTICS_COOKIE)?.value === analyticsToken();
}
