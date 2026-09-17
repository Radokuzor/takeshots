"use client";
import { create } from "zustand";
import type { CartItem } from "./types";

interface CartStore {
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
}

export const useCart = create<CartStore>()((set) => ({
  buyNowItem: null,
  setBuyNowItem: (item) => set({ buyNowItem: item }),
}));
