import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { OccasionTag, Product } from "@/lib/types";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop All Gifts",
  description: "Browse the best gifts for bachelorette parties, birthdays, anniversaries, game nights, and more.",
};

async function getAllProducts(): Promise<Product[]> {
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const params = await searchParams;
  const products = await getAllProducts();
  return <ShopClient products={products} initialOccasion={(params.occasion as OccasionTag) ?? "all"} />;
}
