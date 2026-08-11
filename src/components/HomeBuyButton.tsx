"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  name: string;
  price: number;
  photoUrl?: string;
  className?: string;
}

export default function HomeBuyButton({ name, price, photoUrl, className }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [buyingNow, setBuyingNow] = useState(false);

  async function buyNow() {
    setBuyingNow(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              product: { name, price, photo_url: photoUrl ?? null },
              quantity,
            },
          ],
        }),
      });
      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } finally {
      setBuyingNow(false);
    }
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

      <button onClick={buyNow} disabled={buyingNow} className={className}>
        {buyingNow ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing…
          </>
        ) : (
          `Buy Now — $${(price * quantity).toFixed(2)}`
        )}
      </button>
    </div>
  );
}
