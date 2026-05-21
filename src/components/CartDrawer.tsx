"use client";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQuantity, total, clearCart } = useCart();

  async function handleCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#F5F4F0] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDEBE5]">
          <h2 className="font-black text-lg uppercase">Your Cart</h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {items.length === 0 && (
            <p className="text-[#1A1A1A]/50 text-sm mt-8 text-center">Your cart is empty.</p>
          )}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-3">
              {product.photo_url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#EDEBE5]">
                  <Image
                    src={product.photo_url}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.name}</p>
                <p className="text-[#FF6B35] font-bold text-sm">${product.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-6 h-6 rounded-full bg-[#EDEBE5] flex items-center justify-center"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-6 h-6 rounded-full bg-[#EDEBE5] flex items-center justify-center"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="ml-auto text-[#1A1A1A]/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#EDEBE5]">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>${total().toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full text-center">
              Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-[#1A1A1A]/40 mt-3 hover:text-[#1A1A1A] transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
