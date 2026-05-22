import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import EmailCapture from "@/components/EmailCapture";
import HeroCarousel from "@/components/HeroCarousel";
import GetDiscountButton from "@/components/GetDiscountButton";

export const metadata: Metadata = {
  title: "TakeShots — The Best Gifts for Every Occasion",
  description:
    "Discover the best gifts for bachelorette parties, birthdays, anniversaries, game nights, weddings, and holidays. Free shipping on orders over $50.",
  openGraph: {
    title: "TakeShots — The Best Gifts for Every Occasion",
    description: "Bachelorette parties, birthdays, anniversaries, game nights — discover gifts they'll actually love.",
  },
};

const occasions = [
  { tag: "bachelorette", label: "Bachelorette", emoji: "🥂", color: "#FF6B35" },
  { tag: "wedding", label: "Wedding", emoji: "💍", color: "#C084FC" },
  { tag: "birthday", label: "Birthday", emoji: "🎂", color: "#FBBF24" },
  { tag: "anniversary", label: "Anniversary", emoji: "❤️", color: "#F43F5E" },
  { tag: "game_night", label: "Game Night", emoji: "🎮", color: "#22C55E" },
  { tag: "holiday", label: "Holiday", emoji: "🎁", color: "#3B82F6" },
];

const cities = [
  { name: "Austin", slug: "austin", description: "Sixth Street & beyond" },
  { name: "Houston", slug: "houston", description: "Montrose to Midtown" },
  { name: "Dallas", slug: "dallas", description: "Deep Ellum & Uptown" },
];

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .limit(4);
  return (data as Product[]) ?? [];
}

async function getLatestBlogSlug(): Promise<string> {
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("category", "blog")
    .order("last_updated", { ascending: false })
    .limit(1)
    .single();
  return data?.slug ?? null;
}

async function getCarouselProducts(): Promise<Product[]> {
  // Prefer featured products; fall back to newest products if none are featured
  const { data: featured } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .not("photo_url", "is", null)
    .limit(6);
  if (featured?.length) return featured as Product[];

  const { data: fallback } = await supabase
    .from("products")
    .select("*")
    .not("photo_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(6);
  return (fallback as Product[]) ?? [];
}

export default async function HomePage() {
  const [featured, carouselProducts, latestBlogSlug] = await Promise.all([
    getFeaturedProducts(),
    getCarouselProducts(),
    getLatestBlogSlug(),
  ]);

  return (
    <>
      {/* ── Section 1: Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="headline mb-6">
            The Best Gifts<br />for Every Occasion
          </h1>
          <p className="text-lg text-[#1A1A1A]/70 max-w-md mb-8 leading-relaxed">
            Bachelorette parties, birthdays, anniversaries, game nights — discover
            gifts they&apos;ll actually love.
          </p>
          <div className="flex flex-wrap gap-4">
            <GetDiscountButton className="btn-primary text-base" />
            <Link
              href={latestBlogSlug ? `/blog/${latestBlogSlug}` : "/blog"}
              className="btn-ghost text-base"
            >
              Browse Gift Guides
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
          <HeroCarousel products={carouselProducts} />
        </div>
      </section>

      {/* ── Section 2: Occasion Categories ── */}
      <section className="bg-[#EDEBE5] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="headline text-center mb-10 text-2xl md:text-4xl">
            Shop by Occasion
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {occasions.map((o) => (
              <Link
                key={o.tag}
                href={`/gifts/${o.tag}`}
                className="card p-5 flex flex-col items-center gap-3 hover:shadow-lg transition-all text-center group"
              >
                <span className="text-3xl">{o.emoji}</span>
                <span className="font-bold text-sm uppercase tracking-wide group-hover:text-[#FF6B35] transition-colors">
                  {o.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Featured Gift Picks ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="headline text-2xl md:text-4xl">Featured Gift Picks</h2>
          <Link href="/shop" className="text-[#FF6B35] font-bold text-sm uppercase tracking-wide hover:opacity-70 transition-opacity">
            See All →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4">
                <div className="aspect-square rounded-xl bg-[#EDEBE5] mb-4 animate-pulse" />
                <div className="h-3 bg-[#EDEBE5] rounded mb-2 w-3/4 animate-pulse" />
                <div className="h-3 bg-[#EDEBE5] rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 4: Play the Game ── */}
      <section className="bg-[#EDEBE5] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="headline mb-4">Play the TakeShots Game</h2>
          <p className="text-[#1A1A1A]/70 text-lg mb-8 max-w-md mx-auto">
            Jump in with friends or strangers. No download needed.
          </p>
          <Link href="/play" className="btn-primary text-base">
            Play Now
          </Link>
        </div>
      </section>

      {/* ── Section 5: Near Me ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="headline mb-3">Find the Best Bars Near You</h2>
        <p className="text-[#1A1A1A]/70 text-lg mb-8 max-w-xl">
          Hand-picked bars for bachelorettes, birthdays, and big nights out.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/near-me/${city.slug}`}
              className="card p-6 group flex flex-col gap-2"
            >
              <span className="font-black text-2xl uppercase group-hover:text-[#FF6B35] transition-colors">
                {city.name}
              </span>
              <span className="text-[#1A1A1A]/60 text-sm">{city.description}</span>
              <span className="text-[#FF6B35] font-bold text-sm mt-2">View Guide →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section 6: Email Capture ── */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="headline text-white mb-3">Get 20% Off Your First Order</h2>
          <p className="text-white/80 text-lg mb-8">Join the list. Get the discount. No spam.</p>
          <div className="flex justify-center">
            <EmailCapture source="hero" dark />
          </div>
        </div>
      </section>
    </>
  );
}
