"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function JoinHint({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/play/join` : "";
    navigator.clipboard.writeText(url ? `${url} — code ${code}` : code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="mt-10 mx-auto flex items-center gap-2 text-xs font-bold text-[#1A1A1A]/50 hover:text-[#1A1A1A]/80 transition"
    >
      Others can join anytime at /play/join with code
      <span className="tracking-widest text-[#1A1A1A]">{code}</span>
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={13} />}
    </button>
  );
}
