"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  if (!images.length) return null;

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + images.length) % images.length);

  return (
    <div className="min-w-0">
      <div
        className="group relative aspect-square rounded-[2rem] overflow-hidden bg-white border border-ink/5 shadow-[0_30px_60px_-30px_rgba(255,69,0,0.35)]"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        <Image
          key={images[active]}
          src={images[active]}
          alt={`${productName} — image ${active + 1} of ${images.length}`}
          fill
          className="object-contain p-6 sm:p-10 animate-[fadeIn_.3s_ease]"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={active === 0}
        />
        <span className="tag absolute top-4 left-4">New · V2</span>
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-4 right-4 text-xs font-semibold bg-ink/80 text-white rounded-full px-2.5 py-1 tabular-nums">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative snap-start shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden bg-white transition-all ${
                i === active ? "ring-2 ring-coral" : "ring-1 ring-ink/10 opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
            >
              <Image src={img} alt="" fill className="object-contain p-1.5" sizes="72px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
