"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  caption: string;
}

const INTERVAL = 3200;

export default function BrandCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  function scrollByCard(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]") as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;

    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const atStart = track.scrollLeft <= 4;

    if (dir === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: dir * step, behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => scrollByCard(1), INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 0%, #0F3A42 0%, #05171B 65%, #020C0E 100%)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-white font-black text-2xl md:text-4xl uppercase text-center mb-10">
          Built for Every Occasion
        </h2>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((s) => (
              <div
                key={s.image}
                data-card
                className="snap-start shrink-0 w-[70%] sm:w-[38%] lg:w-[calc(25%-12px)]"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <Image
                    src={s.image}
                    alt={s.caption}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 70vw, (max-width: 1024px) 38vw, 23vw"
                  />
                </div>
                <p className="text-white font-black text-sm uppercase tracking-wide text-center mt-3">
                  {s.caption}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollByCard(-1)}
            className="hidden sm:flex absolute -left-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            className="hidden sm:flex absolute -right-4 top-[38%] -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
