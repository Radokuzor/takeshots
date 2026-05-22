"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import EmailCapture from "@/components/EmailCapture";

export default function DiscountModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-discount-popup", handler);
    return () => window.removeEventListener("open-discount-popup", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <span className="text-4xl">🎁</span>
          <h2 className="font-black text-2xl mt-3 mb-1">Get 20% Off</h2>
          <p className="text-[#1A1A1A]/60 text-sm">
            Drop your email and we&apos;ll send your discount code instantly. No spam, ever.
          </p>
        </div>

        <EmailCapture source="popup" />
      </div>
    </div>
  );
}
