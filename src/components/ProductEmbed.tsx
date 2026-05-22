"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ProductEmbed({ product }: { product: Product }) {
  const { addItem } = useCart();
  const img = product.photo_urls?.[0] ?? product.photo_url;
  const [buyingNow, setBuyingNow] = useState(false);
  const [added, setAdded] = useState(false);

  async function buyNow() {
    setBuyingNow(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ product, quantity: 1 }] }),
      });
      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } finally {
      setBuyingNow(false);
    }
  }

  function handleAddToCart() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="my-6 flex gap-4 p-4 rounded-2xl border-2 border-[#EDEBE5] bg-white not-prose shadow-sm">
      {img && (
        <Link href={`/shop/${product.id}`} className="flex-shrink-0">
          <Image
            src={img}
            alt={product.name}
            width={96}
            height={96}
            className="rounded-xl object-cover w-24 h-24"
          />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <Link
          href={`/shop/${product.id}`}
          className="font-black text-base leading-snug hover:text-[#FF6B35] transition-colors line-clamp-2 block"
        >
          {product.name}
        </Link>
        <p className="text-[#FF6B35] font-bold text-lg mt-1">${product.price.toFixed(2)}</p>
        {product.description && (
          <p className="text-sm text-[#1A1A1A]/60 mt-1 line-clamp-2 leading-snug">
            {product.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={buyNow}
            disabled={buyingNow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {buyingNow ? <><Loader2 size={12} className="animate-spin" /> Processing…</> : "Buy Now"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={added}
            className="flex items-center gap-1 px-3 py-1.5 rounded-pill border-2 border-[#EDEBE5] text-sm font-bold hover:border-[#FF6B35] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {added ? <><Check size={12} /> Added!</> : <><ShoppingCart size={12} /> Add to Cart</>}
          </button>
          <Link
            href={`/shop/${product.id}`}
            className="px-3 py-1.5 rounded-pill border-2 border-[#EDEBE5] text-sm font-bold hover:border-[#FF6B35] transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
