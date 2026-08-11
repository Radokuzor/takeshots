"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  name: string;
  price: number;
  photoUrl?: string;
  className?: string;
}

export default function HomeBuyButton({ name, price, photoUrl, className }: Props) {
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
              quantity: 1,
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
    <button onClick={buyNow} disabled={buyingNow} className={className}>
      {buyingNow ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Processing…
        </>
      ) : (
        `Buy Now — $${price.toFixed(2)}`
      )}
    </button>
  );
}
