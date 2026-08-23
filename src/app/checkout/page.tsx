"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart";
import type { CartItem } from "@/lib/types";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#FF6B35",
    colorBackground: "#ffffff",
    colorText: "#1A1A1A",
    colorTextSecondary: "#1A1A1A99",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "2px solid #EDEBE5",
      boxShadow: "none",
      padding: "12px",
    },
    ".Input:focus": {
      border: "2px solid #FF6B35",
      boxShadow: "none",
    },
    ".Tab": {
      border: "2px solid #EDEBE5",
      boxShadow: "none",
    },
    ".Tab:hover": {
      border: "2px solid #FF6B35",
    },
    ".Tab--selected": {
      border: "2px solid #FF6B35",
      boxShadow: "none",
    },
    ".Label": {
      fontWeight: "600",
      fontSize: "13px",
    },
  },
};

function OrderSummaryItems({ items }: { items: CartItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map(({ product, quantity }) => (
        <div key={product.id} className="flex gap-3">
          {product.photo_url && (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#EDEBE5]">
              <Image
                src={product.photo_url}
                alt={product.name}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            <p className="text-[#1A1A1A]/50 text-xs">Qty {quantity}</p>
          </div>
          <p className="font-bold text-sm">${(product.price * quantity).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, buyNowItem } = useCart();
  const router = useRouter();
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const total = checkoutItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCart.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (checkoutItems.length === 0) {
      router.replace("/shop");
      return;
    }
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: checkoutItems }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F5F4F0] py-6 md:py-10 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_360px] gap-6 md:gap-10">
        {/* Mobile: collapsible order summary above the form */}
        <details className="md:hidden bg-white rounded-2xl shadow-sm group">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="font-bold text-sm flex items-center gap-1.5">
              Order summary
              <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
            </span>
            <span className="font-black text-[#FF6B35]">${total.toFixed(2)}</span>
          </summary>
          <div className="px-5 pb-5 pt-1 border-t border-[#EDEBE5]">
            <div className="pt-4">
              <OrderSummaryItems items={checkoutItems} />
            </div>
            <div className="border-t border-[#EDEBE5] mt-4 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </details>

        <div>
          <h1 className="font-black text-xl md:text-2xl uppercase mb-4 md:mb-6">Checkout</h1>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <PaymentForm total={total} />
            </Elements>
          ) : (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-10 bg-[#EDEBE5] rounded-xl" />
              <div className="h-24 bg-[#EDEBE5] rounded-xl" />
              <div className="h-32 bg-[#EDEBE5] rounded-xl" />
            </div>
          )}
        </div>

        {/* Desktop: order summary sidebar */}
        <div className="hidden md:block bg-white rounded-2xl p-5 h-fit shadow-sm">
          <h2 className="font-black text-sm uppercase tracking-wide mb-4">Order Summary</h2>
          <div className="mb-4">
            <OrderSummaryItems items={checkoutItems} />
          </div>
          <div className="border-t border-[#EDEBE5] pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
