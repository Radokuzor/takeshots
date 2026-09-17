// Client-side analytics helpers shared by AnalyticsTracker and the components
// that report custom events. Events travel over a global window event (same
// pattern as `open-discount-popup`) so callers don't need a context provider.

export const TRACK_EVENT = "ts-track";

export type EventProps = Record<string, string | number | boolean | null>;

export interface AnalyticsEvent {
  name: string;
  path: string;
  at: number;
  props?: EventProps;
}

export interface PageVisit {
  path: string;
  enteredAt: number;
  exitedAt: number | null;
  maxScrollPct: number;
}

/** First-touch attribution for the session, kept in sessionStorage so checkout can forward it to Stripe. */
export interface Attribution {
  sessionId: string;
  visitorId: string;
  visitNumber: number;
  landingPage: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export interface SessionPayload {
  sessionId: string;
  visitorId: string;
  visitNumber: number;
  firstSeenAt: number | null;
  startedAt: number;
  endedAt: number;
  pages: PageVisit[];
  events: AnalyticsEvent[];
  referrer: string | null;
  landingUrl: string;
  utm: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>>;
  screen: string;
  viewport: string;
  language: string | null;
  timezone: string | null;
  connection: string | null;
  touch: boolean;
  purchased: boolean;
}

export const ATTRIBUTION_KEY = "ts_attribution";

export function trackEvent(name: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: { name, props } }));
}

export function getAttribution(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
