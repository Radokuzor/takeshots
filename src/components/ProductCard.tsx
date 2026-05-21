"use client";
import Image from "next/image";
import Link from "next/link";
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

interface Props {
  product: Product;
  variant?: "grid" | "guide";
}

export default function ProductCard({ product, variant = "grid" }: Props) {
  const { addItem } = useCart();

  if (variant === "guide") {
    return (
      <div className="flex flex-col md:flex-row gap-8 py-10 border-b border-[#EDEBE5] last:border-0">
        {/* Photo */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#EDEBE5]">
            {product.photo_url ? (
              <Image
                src={product.photo_url}
                alt={product.name}
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/20 text-sm">No image</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          {(product.occasion_tags?.length ? product.occasion_tags : product.occasion_tag ? [product.occasion_tag] : []).map((t) => (
            <span key={t} className="tag mb-2 mr-1 inline-block">{OCCASION_LABELS[t]}</span>
          ))}
          <h2 className="font-black text-2xl mb-2">{product.name}</h2>
          {product.description && (
            <p className="text-[#1A1A1A]/70 text-sm leading-relaxed mb-4">{product.description}</p>
          )}

          {product.key_points && product.key_points.length > 0 && (
            <ul className="mb-4 flex flex-col gap-1.5">
              {product.key_points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[#FF6B35] font-bold mt-0.5">→</span>
                  {pt}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {product.pros && product.pros.length > 0 && (
              <div className="flex-1">
                <p className="font-bold text-sm mb-1 text-green-700">Pros</p>
                <ul className="flex flex-col gap-1">
                  {product.pros.map((p, i) => (
                    <li key={i} className="text-sm text-[#1A1A1A]/70">✓ {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.cons && product.cons.length > 0 && (
              <div className="flex-1">
                <p className="font-bold text-sm mb-1 text-red-600">Cons</p>
                <ul className="flex flex-col gap-1">
                  {product.cons.map((c, i) => (
                    <li key={i} className="text-sm text-[#1A1A1A]/70">✗ {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-2xl font-black text-[#FF6B35] mb-4">${product.price.toFixed(2)}</p>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => addItem(product)} className="btn-primary">
              Add to Cart
            </button>
            <button onClick={() => addItem(product)} className="btn-ghost">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-[#EDEBE5]">
          {product.photo_url ? (
            <Image
              src={product.photo_url}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/20 text-sm">No image</div>
          )}
        </div>
        <div className="p-4 pb-2">
          {(product.occasion_tags?.length ? product.occasion_tags : product.occasion_tag ? [product.occasion_tag] : []).map((t) => (
            <span key={t} className="tag mb-1 mr-1 inline-block text-[10px]">{OCCASION_LABELS[t]}</span>
          ))}
          <h3 className="font-bold text-sm leading-snug mb-1">{product.name}</h3>
          <p className="text-[#FF6B35] font-black text-lg mb-3">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => addItem(product)}
          className="flex-1 btn-primary text-sm py-2"
        >
          <ShoppingCart size={14} className="mr-1.5" /> Add to Cart
        </button>
        <Link
          href={`/shop/${product.id}`}
          className="btn-ghost text-sm py-2 px-3"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
