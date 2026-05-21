"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("email_subscribers")
      .upsert({ email, source, discount_claimed: false }, { onConflict: "email" });
    setStatus(error ? "error" : "done");
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
        className={`flex-1 px-4 py-3 rounded-pill border text-sm outline-none focus:ring-2 focus:ring-[#FF6B35] ${
          dark
            ? "bg-white/20 border-white/30 text-white placeholder:text-white/60"
            : "bg-white border-[#EDEBE5] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
        }`}
      />
      <button type="submit" disabled={status === "loading"} className="btn-primary">
        {status === "loading" ? "..." : "Claim My Discount"}
      </button>
      {status === "error" && (
        <p className="text-red-500 text-xs mt-1">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
