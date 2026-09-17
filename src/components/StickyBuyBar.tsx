"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import HomeBuyButton from "@/components/HomeBuyButton";

interface Props {
  name: string;
  price: number;
  photoUrl: string;
  /** Element ids: the bar shows once `startId` scrolls away and hides again when `endId` comes into view. */
  startId: string;
  endId: string;
}

// Mobile-only buy bar, so the purchase CTA is always a thumb away on a long page.
export default function StickyBuyBar({ name, price, photoUrl, startId, endId }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const start = document.getElementById(startId);
      const end = document.getElementById(endId);
      if (!start || !end) return;
      const pastStart = start.getBoundingClientRect().bottom < 0;
      const beforeEnd = end.getBoundingClientRect().top > window.innerHeight;
      setVisible(pastStart && beforeEnd);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [startId, endId]);

  return (
    <div
      aria-hidden={!visible}
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 bg-white/95 backdrop-blur-md border-t border-ink/10 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 shrink-0 rounded-xl bg-cream overflow-hidden">
          <Image src={photoUrl} alt="" fill className="object-contain p-1" sizes="48px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate">Take V2 · Blackout</p>
          <p className="text-sm text-ink/60">${price.toFixed(2)}</p>
        </div>
        <HomeBuyButton
          compact
          name={name}
          price={price}
          photoUrl={photoUrl}
          className="btn-primary !px-5 text-sm"
        />
      </div>
    </div>
  );
}
