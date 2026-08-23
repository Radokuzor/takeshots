"use client";
import { FormEvent, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import {
  AddressElement,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

export default function PaymentForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/return`,
        receipt_email: email || undefined,
      },
    });

    if (submitError) {
      setError(submitError.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/50 mb-2">
          Contact
        </p>
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email)}
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/50 mb-2">
          Shipping address
        </p>
        <AddressElement options={{ mode: "shipping", allowedCountries: ["US", "CA"] }} />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/50 mb-2">
          Payment
        </p>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing…
          </>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-[#1A1A1A]/40">
        <Lock size={12} /> Secure checkout powered by Stripe
      </p>
    </form>
  );
}
