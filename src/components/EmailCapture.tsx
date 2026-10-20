"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface Props {
  source: "hero" | "popup" | "footer" | "play_page";
  dark?: boolean;
}

export default function EmailCapture({ source, dark = false }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const ok = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    })
      .then((r) => r.ok)
      .catch(() => false);
    if (ok) trackEvent("email_signup", { source });
    setStatus(ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <p className={`font-bold text-lg ${dark ? "text-white" : "text-[#1A1A1A]"}`}>
        Check your inbox — your 20% off code is on its way!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={`flex-1 min-w-0 min-h-12 px-5 py-3 rounded-pill border text-base sm:text-sm outline-none focus:ring-2 focus:ring-[#FF6B35] ${
          dark
            ? "bg-white/20 border-white/30 text-white placeholder:text-white/60"
            : "bg-white border-[#EDEBE5] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
        }`}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={dark ? "btn-primary !bg-none !bg-ink !shadow-none" : "btn-primary"}
      >
        {status === "loading" ? "..." : "Claim My Discount"}
      </button>
      {status === "error" && (
        <p className="text-red-500 text-xs mt-1">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
