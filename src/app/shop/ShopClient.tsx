"use client";
import { useState } from "react";
import type { OccasionTag, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const FILTERS: { label: string; value: OccasionTag | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Bachelorette", value: "bachelorette" },
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Game Night", value: "game_night" },
  { label: "Holiday", value: "holiday" },
];

interface Props {
  products: Product[];
  initialOccasion: OccasionTag | "all";
}

export default function ShopClient({ products, initialOccasion }: Props) {
  const [active, setActive] = useState<OccasionTag | "all">(initialOccasion);

  const filtered =
    active === "all"
      ? products
      : products.filter((p) =>
          p.occasion_tags?.includes(active as OccasionTag) || p.occasion_tag === active
        );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="headline mb-8">Shop All Gifts</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`px-5 py-2 rounded-pill font-bold text-sm uppercase tracking-wide border-2 transition-all ${
              active === f.value
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white border-transparent"
                : "border-[#EDEBE5] bg-white text-[#1A1A1A] hover:border-[#FF6B35]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#1A1A1A]/40">
          <p className="text-lg font-semibold">No products yet.</p>
          <p className="text-sm mt-1">Check back soon — more gifts are on the way.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
