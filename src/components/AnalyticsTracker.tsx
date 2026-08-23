"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageVisit {
  path: string;
  enteredAt: number;
  exitedAt: number | null;
  maxScrollPct: number;
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem("ts_session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("ts_session_id", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

// Fires a beacon to /api/analytics/session-end (Telegram notification) when the
// visitor leaves the site. checkout/return/page.tsx sets ts_purchased in
// sessionStorage on a successful order so this doesn't flag it as abandoned.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const pagesRef = useRef<PageVisit[]>([]);
  const currentScrollRef = useRef(0);
  const sentRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef("");

  const tracked = !pathname.startsWith("/admin");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
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
    if (!tracked) return;
    const pages = pagesRef.current;
    const prev = pages[pages.length - 1];
    if (prev && prev.exitedAt === null) {
      prev.exitedAt = Date.now();
      prev.maxScrollPct = currentScrollRef.current;
    }
    pages.push({ path: pathname, enteredAt: Date.now(), exitedAt: null, maxScrollPct: 0 });
  }, [pathname, tracked]);

  // Send the session summary once, when the visitor actually leaves the site.
  useEffect(() => {
    function sendBeaconOnce() {
      if (sentRef.current) return;
      const pages = pagesRef.current;
      if (pages.length === 0) return;
      const last = pages[pages.length - 1];
      if (last.exitedAt === null) {
        last.exitedAt = Date.now();
        last.maxScrollPct = currentScrollRef.current;
      }
      sentRef.current = true;

      let purchased = false;
      try {
        purchased = sessionStorage.getItem("ts_purchased") === "1";
      } catch {
        // sessionStorage unavailable — treat as not purchased
      }

      const payload = {
        sessionId: sessionIdRef.current,
        pages: pages.map((p) => ({
          path: p.path,
          enteredAt: p.enteredAt,
          exitedAt: p.exitedAt,
          maxScrollPct: p.maxScrollPct,
        })),
        startedAt: startedAtRef.current,
        endedAt: Date.now(),
        referrer: document.referrer || null,
        purchased,
      };

      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/session-end", blob);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") sendBeaconOnce();
    }

    window.addEventListener("pagehide", sendBeaconOnce);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", sendBeaconOnce);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
