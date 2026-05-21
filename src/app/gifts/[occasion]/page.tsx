import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { OccasionTag, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const OCCASION_META: Record<OccasionTag, { label: string; intro: string; keyword: string }> = {
  bachelorette: {
    label: "Bachelorette Party Gifts",
    intro: "The ultimate bachelorette party gift guide. Thoughtful, fun, and bride-approved.",
    keyword: "best bachelorette party gifts",
  },
  wedding: {
    label: "Wedding Gifts",
    intro: "Timeless wedding gifts they'll actually use and remember.",
    keyword: "best wedding gifts",
  },
  birthday: {
    label: "Birthday Gifts",
    intro: "Because they deserve something better than a gift card.",
    keyword: "best birthday gifts",
  },
  anniversary: {
    label: "Anniversary Gifts",
    intro: "Celebrate another year with gifts that say 'I still pick you.'",
    keyword: "best anniversary gifts",
  },
  game_night: {
    label: "Game Night Gifts",
    intro: "Level up game night with these crowd-pleasing picks.",
    keyword: "best game night gifts",
  },
  holiday: {
    label: "Holiday Gifts",
    intro: "Holiday gifts worth giving (and receiving).",
    keyword: "best holiday gifts",
  },
};

const VALID_OCCASIONS = Object.keys(OCCASION_META) as OccasionTag[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ occasion: string }>;
}): Promise<Metadata> {
  const { occasion } = await params;
  const meta = OCCASION_META[occasion as OccasionTag];
  if (!meta) return {};
  return {
    title: meta.label,
    description: meta.intro,
    openGraph: { title: `${meta.label} | TakeShots`, description: meta.intro },
  };
}

export function generateStaticParams() {
  return VALID_OCCASIONS.map((occasion) => ({ occasion }));
}

async function getProducts(occasion: OccasionTag): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("occasion_tag", occasion)
    .order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

export default async function GiftGuidePage({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion } = await params;
  if (!VALID_OCCASIONS.includes(occasion as OccasionTag)) notFound();

  const meta = OCCASION_META[occasion as OccasionTag];
  const products = await getProducts(occasion as OccasionTag);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-12">
        <h1 className="headline mb-4">{meta.label}</h1>
        <p className="text-[#1A1A1A]/70 text-lg max-w-2xl">{meta.intro}</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-[#1A1A1A]/40">
          <p className="text-lg font-semibold">Guide coming soon.</p>
          <p className="text-sm mt-1">We&apos;re curating the best picks — check back soon.</p>
        </div>
      ) : (
        <div>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} variant="guide" />
          ))}
        </div>
      )}
    </div>
  );
}
