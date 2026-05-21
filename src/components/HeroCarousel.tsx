"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

const INTERVAL = 4000;

export default function HeroCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const go = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setIndex(((next % products.length) + products.length) % products.length);
        setAnimating(false);
      }, 300);
    },
    [animating, products.length]
  );

  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    const id = setInterval(() => go(index + 1), INTERVAL);
    return () => clearInterval(id);
  }, [index, paused, products.length, go]);

  if (!products.length) return null;

  const product = products[index];
  const img = product.photo_urls?.[0] ?? product.photo_url;

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#EDEBE5] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide image */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: animating ? 0 : 1 }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EDEBE5] to-[#E0DDD7]" />
        )}

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Product info */}
      <div
        className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 transition-all duration-300"
        style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px)" : "translateY(0)" }}
      >
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
          Featured Gift
        </p>
        <h3 className="text-white font-black text-lg sm:text-xl leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[#FF6B35] font-bold text-lg mb-4">${product.price.toFixed(2)}</p>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/shop/${product.id}`}
            className="px-4 py-2 rounded-pill bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Buy Now
          </Link>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-white/20 backdrop-blur-sm text-white font-bold text-sm border border-white/30 hover:bg-white/30 transition-colors"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {products.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {products.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
