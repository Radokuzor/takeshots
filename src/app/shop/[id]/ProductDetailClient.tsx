"use client";
import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";

const OCCASION_LABELS: Record<string, string> = {
  bachelorette: "Bachelorette",
  wedding: "Wedding",
  birthday: "Birthday",
  anniversary: "Anniversary",
  game_night: "Game Night",
  holiday: "Holiday",
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const allImages = product.photo_urls?.length
    ? product.photo_urls
    : product.photo_url
    ? [product.photo_url]
    : [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col md:flex-row gap-10">
      {/* Image gallery */}
      <div className="w-full md:w-[420px] flex-shrink-0">
        <div className="aspect-square rounded-2xl overflow-hidden bg-[#EDEBE5] mb-3">
          {allImages[active] ? (
            <Image
              src={allImages[active]}
              alt={product.name}
              width={500}
              height={500}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/20">No image</div>
          )}
        </div>
        {allImages.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-xl overflow-hidden border-2 transition-all ${i === active ? "border-[#FF6B35]" : "border-[#EDEBE5] hover:border-[#FF6B35]/50"}`}
              >
                <Image src={src} alt={`view ${i + 1}`} width={64} height={64} className="object-cover w-16 h-16" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        {product.occasion_tag && (
          <span className="tag mb-3 inline-block">{OCCASION_LABELS[product.occasion_tag]}</span>
        )}
        <h1 className="font-black text-3xl leading-tight mb-3">{product.name}</h1>
        <p className="text-3xl font-black text-[#FF6B35] mb-4">${product.price.toFixed(2)}</p>

        {product.description && (
          <p className="text-[#1A1A1A]/70 leading-relaxed mb-5">{product.description}</p>
        )}

        {product.key_points && product.key_points.length > 0 && (
          <ul className="mb-5 flex flex-col gap-2">
            {product.key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[#FF6B35] font-bold mt-0.5">→</span>
                {pt}
              </li>
            ))}
          </ul>
        )}

        {(product.pros?.length || product.cons?.length) ? (
          <div className="flex flex-col sm:flex-row gap-5 mb-6 p-4 bg-[#F5F4F0] rounded-2xl">
            {product.pros && product.pros.length > 0 && (
              <div className="flex-1">
                <p className="font-bold text-sm mb-2 text-green-700">Pros</p>
                <ul className="flex flex-col gap-1.5">
                  {product.pros.map((p, i) => (
                    <li key={i} className="text-sm text-[#1A1A1A]/70">✓ {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.cons && product.cons.length > 0 && (
              <div className="flex-1">
                <p className="font-bold text-sm mb-2 text-red-600">Cons</p>
                <ul className="flex flex-col gap-1.5">
                  {product.cons.map((c, i) => (
                    <li key={i} className="text-sm text-[#1A1A1A]/70">✗ {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button onClick={() => addItem(product)} className="btn-primary">
            <ShoppingCart size={16} className="mr-2" /> Add to Cart
          </button>
          {product.amazon_asin && (
            <a
              href={`https://www.amazon.com/dp/${product.amazon_asin}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-ghost"
            >
              View on Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
