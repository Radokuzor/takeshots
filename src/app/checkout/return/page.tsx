"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutReturnContent />
    </Suspense>
  );
}

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const { setBuyNowItem } = useCart();
  const [status, setStatus] = useState<"loading" | "complete" | "failed">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentIntentId) {
      setStatus("failed");
      return;
    }
    fetch(`/api/checkout/session-status?payment_intent=${paymentIntentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "succeeded") {
          setStatus("complete");
          setEmail(data.customerEmail);
          setBuyNowItem(null);
          trackEvent("purchase", { payment_intent: paymentIntentId });
          try {
            sessionStorage.setItem("ts_purchased", "1");
          } catch {
            // sessionStorage unavailable — abandonment flag will be a false positive
          }
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntentId]);

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto animate-spin text-[#FF6B35]" size={40} />
            <p className="mt-4 text-[#1A1A1A]/60">Confirming your order…</p>
          </>
        )}
        {status === "complete" && (
          <>
            <CheckCircle2 className="mx-auto text-[#FF6B35]" size={48} />
            <h1 className="font-black text-xl uppercase mt-4">Order confirmed!</h1>
            <p className="mt-2 text-[#1A1A1A]/60 text-sm">
              {email
                ? `A confirmation has been sent to ${email}.`
                : "Thanks for your order."}
            </p>
            <Link href="/" className="btn-primary inline-block mt-6">
              Back to home
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="mx-auto text-red-500" size={48} />
            <h1 className="font-black text-xl uppercase mt-4">Something went wrong</h1>
            <p className="mt-2 text-[#1A1A1A]/60 text-sm">
              We couldn&apos;t confirm your order. If you were charged, contact us for support.
            </p>
            <Link href="/" className="btn-primary inline-block mt-6">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
