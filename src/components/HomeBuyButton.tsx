"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

interface Props {
  name: string;
  price: number;
  photoUrl?: string;
  className?: string;
}

export default function HomeBuyButton({ name, price, photoUrl, className }: Props) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const setBuyNowItem = useCart((s) => s.setBuyNowItem);

  function buyNow() {
    const product: Product = {
      id: `promo-${name}`,
      name,
      description: null,
      price,
      photo_url: photoUrl ?? null,
      created_at: new Date().toISOString(),
    };
    setBuyNowItem({ product, quantity });
    router.push("/checkout");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3 rounded-pill border-2 border-[#1A1A1A] px-1 py-1">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1A1A1A]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-[1.5rem] text-center font-bold text-sm">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(20, q + 1))}
          disabled={quantity >= 20}
          aria-label="Increase quantity"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1A1A1A]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <button onClick={buyNow} className={className}>
        Buy Now — ${(price * quantity).toFixed(2)}
      </button>
    </div>
  );
}
