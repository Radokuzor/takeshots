"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function useBuyNow() {
  const router = useRouter();
  const setBuyNowItem = useCart((s) => s.setBuyNowItem);

  return function buyNow(product: Product, quantity = 1) {
    setBuyNowItem({ product, quantity });
    router.push("/checkout");
  };
}
