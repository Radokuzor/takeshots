"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ATTRIBUTION_KEY,
  TRACK_EVENT,
  type AnalyticsEvent,
  type Attribution,
  type EventProps,
  type PageVisit,
  type SessionPayload,
} from "@/lib/analytics";

const MAX_EVENTS = 150;
const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

function safeGet(store: Storage, key: string) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    // storage unavailable (private mode etc.) — analytics degrade gracefully
  }
}

/** Loads (or creates) this tab's attribution: session id, visitor id, visit number, UTM, referrer. */
function initAttribution(): { attribution: Attribution; firstSeenAt: number | null; utm: SessionPayload["utm"] } {
  const existing = safeGet(sessionStorage, ATTRIBUTION_KEY);
  const firstSeenRaw = safeGet(localStorage, "ts_first_seen");
  if (existing) {
    const attribution = JSON.parse(existing) as Attribution;
    const utm: SessionPayload["utm"] = {};
    for (const k of UTM_KEYS) {
      const v = attribution[`utm_${k}`];
      if (v) utm[k] = v;
    }
    return { attribution, firstSeenAt: firstSeenRaw ? Number(firstSeenRaw) : null, utm };
  }

  let visitorId = safeGet(localStorage, "ts_visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    safeSet(localStorage, "ts_visitor_id", visitorId);
    safeSet(localStorage, "ts_first_seen", String(Date.now()));
  }
  const visitNumber = Number(safeGet(localStorage, "ts_visit_count") ?? "0") + 1;
  safeSet(localStorage, "ts_visit_count", String(visitNumber));

  const params = new URLSearchParams(window.location.search);
  const utm: SessionPayload["utm"] = {};
  for (const k of UTM_KEYS) {
    const v = params.get(`utm_${k}`);
    if (v) utm[k] = v.slice(0, 200);
  }
  // Common ad click ids double as a source when no utm_source is set.
  if (!utm.source) {
    if (params.get("fbclid")) utm.source = "facebook";
    else if (params.get("gclid")) utm.source = "google-ads";
    else if (params.get("ttclid")) utm.source = "tiktok";
  }

  // Treat same-site referrers as "no referrer".
  let referrer: string | null = document.referrer || null;
  try {
    if (referrer && new URL(referrer).host === window.location.host) referrer = null;
  } catch {
    // malformed referrer — keep as-is
  }

  const attribution: Attribution = {
    sessionId: crypto.randomUUID(),
    visitorId,
    visitNumber,
    landingPage: window.location.pathname + window.location.search,
    referrer,
    utm_source: utm.source ?? null,
    utm_medium: utm.medium ?? null,
    utm_campaign: utm.campaign ?? null,
    utm_term: utm.term ?? null,
    utm_content: utm.content ?? null,
  };
  safeSet(sessionStorage, ATTRIBUTION_KEY, JSON.stringify(attribution));
  return {
    attribution,
    firstSeenAt: Number(safeGet(localStorage, "ts_first_seen")) || null,
    utm,
  };
}

function describeTarget(el: Element): { label: string; href: string | null } {
  const text =
    el.getAttribute("aria-label") ||
    (el as HTMLElement).innerText ||
    el.getAttribute("title") ||
    el.tagName.toLowerCase();
  return {
    label: text.replace(/\s+/g, " ").trim().slice(0, 60),
    href: el instanceof HTMLAnchorElement ? el.href : null,
  };
}

// Sends the session snapshot to /api/analytics/session-end every time the tab
// is hidden (the server upserts on sessionId, so later snapshots replace
// earlier ones). checkout/return/page.tsx sets ts_purchased in sessionStorage on
// a successful order so this doesn't flag it as abandoned.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const pagesRef = useRef<PageVisit[]>([]);
  const eventsRef = useRef<AnalyticsEvent[]>([]);
  const currentScrollRef = useRef(0);
  const sentRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const initRef = useRef<ReturnType<typeof initAttribution> | null>(null);
  const pathRef = useRef(pathname);

  const tracked = !pathname.startsWith("/admin");
  pathRef.current = pathname;

  useEffect(() => {
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
    try {
      initRef.current = initAttribution();
    } catch {
      initRef.current = null;
    }
  }, []);

  // Custom events (trackEvent) + generic click capture on links and buttons.
  useEffect(() => {
    function push(name: string, props?: EventProps) {
      if (pathRef.current.startsWith("/admin")) return;
      if (eventsRef.current.length >= MAX_EVENTS) return;
      eventsRef.current.push({ name, path: pathRef.current, at: Date.now(), props });
    }
    function onTrack(e: Event) {
      const { name, props } = (e as CustomEvent<{ name: string; props?: EventProps }>).detail;
      push(name, props);
    }
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("a, button, [role=button], summary");
      if (!el) return;
      const { label, href } = describeTarget(el);
      let outbound = false;
      try {
        outbound = !!href && new URL(href).host !== window.location.host;
      } catch {
        // non-URL href
      }
      push(outbound ? "outbound_click" : "click", { label, href });
    }
    window.addEventListener(TRACK_EVENT, onTrack);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener(TRACK_EVENT, onTrack);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  // Track max scroll depth reached on the current page.
  useEffect(() => {
    if (!tracked) return;
    currentScrollRef.current = 0;
    let ticking = false;
    function measure() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (pct > currentScrollRef.current) currentScrollRef.current = pct;
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, tracked]);

  // Record each page visited during the session.
  useEffect(() => {
    const pages = pagesRef.current;
    const prev = pages[pages.length - 1];
    if (prev && prev.exitedAt === null) {
      prev.exitedAt = Date.now();
      prev.maxScrollPct = currentScrollRef.current;
    }
    if (!tracked) return;
    pages.push({ path: pathname, enteredAt: Date.now(), exitedAt: null, maxScrollPct: 0 });
  }, [pathname, tracked]);

  // Send a snapshot whenever the visitor hides/leaves the tab.
  useEffect(() => {
    function sendSnapshot() {
      if (sentRef.current) return;
      const init = initRef.current;
      const pages = pagesRef.current;
      if (!init || pages.length === 0 || startedAtRef.current === null) return;
      sentRef.current = true;

      const now = Date.now();
      const snapshotPages = pages.map((p, i) =>
        i === pages.length - 1 && p.exitedAt === null
          ? { ...p, exitedAt: now, maxScrollPct: currentScrollRef.current }
          : p
      );

      const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
      let timezone: string | null = null;
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        // unsupported
      }

      const { attribution, firstSeenAt, utm } = init;
      const payload: SessionPayload = {
        sessionId: attribution.sessionId,
        visitorId: attribution.visitorId,
        visitNumber: attribution.visitNumber,
        firstSeenAt,
        startedAt: startedAtRef.current,
        endedAt: now,
        pages: snapshotPages,
        events: eventsRef.current,
        referrer: attribution.referrer,
        landingUrl: attribution.landingPage,
        utm,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || null,
        timezone,
        connection: nav.connection?.effectiveType ?? null,
        touch: navigator.maxTouchPoints > 0,
        purchased: safeGet(sessionStorage, "ts_purchased") === "1",
      };

      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/session-end", blob);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        sendSnapshot();
      } else {
        // Visitor came back — allow the next hide to send an updated snapshot.
        sentRef.current = false;
      }
    }

    window.addEventListener("pagehide", sendSnapshot);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", sendSnapshot);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
