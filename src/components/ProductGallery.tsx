"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  return (
    <div className="min-w-0">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white">
        <Image
          key={images[active]}
          src={images[active]}
          alt={productName}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white transition-all ${
                i === active ? "ring-2 ring-[#FF6B35]" : "ring-1 ring-black/10 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img} alt="" fill className="object-contain p-1.5" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
