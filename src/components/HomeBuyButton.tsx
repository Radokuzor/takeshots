"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface Props {
  name: string;
  price: number;
  photoUrl?: string;
  className?: string;
  /** Hide the quantity stepper (used by the sticky mobile bar). */
  compact?: boolean;
  /** Visual treatment for the stepper when placed on a dark/coral background. */
  onDark?: boolean;
}

export default function HomeBuyButton({ name, price, photoUrl, className, compact, onDark }: Props) {
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
    trackEvent("buy_now_click", { quantity, value: +(price * quantity).toFixed(2), placement: compact ? "compact" : "full" });
    setBuyNowItem({ product, quantity });
    router.push("/checkout");
  }

  if (compact) {
    return (
      <button onClick={buyNow} className={className}>
        <ShoppingBag size={18} /> Buy Now
      </button>
    );
  }

  const stepperBtn = `w-10 h-11 sm:w-11 flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
    onDark ? "hover:bg-white/15" : "hover:bg-ink/5"
  }`;

  return (
    <div className="flex items-stretch gap-3 w-full sm:w-auto">
      <div
        className={`flex items-center shrink-0 rounded-full border-2 ${
          onDark ? "border-white/60 text-white" : "border-ink/15 bg-white"
        }`}
      >
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className={stepperBtn}
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(20, q + 1))}
          disabled={quantity >= 20}
          aria-label="Increase quantity"
          className={stepperBtn}
        >
          <Plus size={16} />
        </button>
      </div>

      <button onClick={buyNow} className={`${className ?? ""} flex-1 min-w-0 !px-4 sm:!px-7 sm:flex-none`}>
        <ShoppingBag size={18} />
        <span className="hidden min-[400px]:inline">Buy Now —</span>
        <span className="min-[400px]:hidden">Buy ·</span>
        <span>${(price * quantity).toFixed(2)}</span>
      </button>
    </div>
  );
}
