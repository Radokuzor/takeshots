import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star, Zap, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import EmailCapture from "@/components/EmailCapture";
import ProductGallery from "@/components/ProductGallery";
import BrandCarousel from "@/components/BrandCarousel";
import HomeBuyButton from "@/components/HomeBuyButton";

export const metadata: Metadata = {
  title: "The Take V2 — Shot Holder & Straw | TakeShots",
  description:
    "Meet the Take V2: a shot holder & straw that turns every shot into a smooth, no-spill chaser. Fits any bottle or glass. Take your next party to the next level.",
  openGraph: {
    title: "The Take V2 — Shot Holder & Straw | TakeShots",
    description:
      "A patented shot holder & straw that makes the leap from shot to chaser seamless. No spills, no burn, no fumbling.",
  },
};

const PRODUCT = {
  name: "TakeShots Take V2",
  tagline: "Take Shots Like Never Before",
  price: 19.99,
  rating: 4.2,
  reviewCount: 300,
  color: "Blackout",
  description:
    "The Take V2 is a patented shot holder & straw that makes the leap from shot to chaser completely seamless. Drop the straw into your chaser or mixed drink, take your shot, and let the burn disappear — no fumbling, no spilling, no excuses.",
  images: [
    "https://m.media-amazon.com/images/I/71193Q2smAL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8a7b22dc-5965-4441-a4f0-a45ccea13c4a.__CR0,0,970,600_PT0_SX1200_V1___.jpg",
    "https://m.media-amazon.com/images/I/612L6ixcPrL._AC_SL1080_.jpg",
    "https://m.media-amazon.com/images/I/71cUBP7d08L._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/81ebIcWx1GL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/81EAd-zOSWL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/81LAnQ6x4lL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/517CqrCxJgL._AC_SL1500_.jpg",
  ],
};

const BRAND_STORY = {
  image:
    "https://m.media-amazon.com/images/S/aplus-media-library-service-media/5d24867d-ff73-4ab9-b768-f100fb9e1eba.__CR0,0,1464,625_PT0_SX1600_V1___.png",
  eyebrow: "Shoot Your Shot",
  title: "It's Not Just a Straw. It's a Movement.",
  body: "TakeShots is a new and exciting way to enjoy shots on-the-go. Our patented shot straw makes shots go down smoother than ever with a seamless transition of shot to chaser. Party smarter and keep the world green by using our refillable shot straws.",
};

const lifestyle = [
  {
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8f8f722c-8785-4097-b02d-0f0b19c19465.__CR737,0,1072,1342_PT0_SX1000_V1___.jpg",
    caption: "Game Days",
  },
  {
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/ab0b1170-6a95-409e-b3f5-0675c39f2b72.__CR129,0,613,767_PT0_SX1000_V1___.png",
    caption: "Beach Trips",
  },
  {
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/4eebb183-3d46-4b42-8e12-7c11b6f26e4f.__CR201,0,1598,2000_PT0_SX1000_V1___.png",
    caption: "Pool Parties",
  },
  {
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8173e5aa-1931-4973-b77b-3aa5b79424a7.__CR0,123,3000,3754_PT0_SX1000_V1___.jpg",
    caption: "Pool Days",
  },
  {
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/de4169c4-116d-4452-b606-f5fe60c523f9.__CR165,0,444,556_PT0_SX1000_V1___.png",
    caption: "On the Go",
  },
  {
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/a71eed0b-0f60-4451-be9c-5c2bc47de6c0.__CR0,30,557,697_PT0_SX1000_V1___.png",
    caption: "Any Occasion",
  },
];

const productDetails = {
  diagram:
    "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8e9e7ad5-5b40-4e35-aa54-43d889debc4b.__CR0,0,970,600_PT0_SX1200_V1___.png",
  caseImage:
    "https://m.media-amazon.com/images/S/aplus-media-library-service-media/8a7b22dc-5965-4441-a4f0-a45ccea13c4a.__CR0,0,970,600_PT0_SX1400_V1___.jpg",
  specs: [
    "Twistable cap for a secure, no-spill seal",
    "Screw-off lid for easy filling",
    "Securely holds 1 fl oz",
    "Made with BPA-free, medical-grade Tritan materials",
    "One-way valve lets liquid flow through, never out",
  ],
};

const features = [
  {
    icon: Zap,
    title: "Shot to Chaser, Seamlessly",
    body: "Our patented design lets you drop the straw straight into a chaser or mixed drink, so the burn disappears the moment it hits.",
  },
  {
    icon: ShieldCheck,
    title: "No-Spill Seal",
    body: "A patented seal keeps your shot locked inside the Take on any adventure — no leaks, no party fouls.",
  },
  {
    icon: MapPin,
    title: "Fits Any Bottle or Glass",
    body: "Built to fit all standard bottles and drink glasses, the Take goes wherever the party goes.",
  },
  {
    icon: Sparkles,
    title: "Built to Last",
    body: "Made from sustainable, food-safe plastic — durable enough to live in your bag, purse, or golf bag.",
  },
];

const steps = [
  { step: "01", title: "Fill the Straw", body: "Load the Take with your shot, wellness shot, or anything you want to chase." },
  { step: "02", title: "Drop It In", body: "Set the straw into your chaser or mixed drink — no spills, no setup." },
  { step: "03", title: "Take the Shot", body: "Sip through the burn straight into the chaser. Smoothest shot you've ever taken." },
];

// Real reviews pulled from the Amazon listing (amazon.com/dp/B0B5FHK5SN)
const reviews = [
  {
    stars: 5,
    title: "WOW! lifesaver is that you?",
    body: "I bought this after seeing it used to take horrible tasting herbal supplements (soursop & black seed bitters) and OMG yesssss! It helps me tremendously to get it all down in one try!! BUY IT!! I haven't even tried it with a alcoholic shot yet lol but Im for sure it works. Thank you!!",
    author: "ShaTerrica Brigman",
    date: "April 12, 2026",
  },
  {
    stars: 5,
    title: "Good product",
    body: "Does amazing job I already had one but it got ruined from a drink that had pulp in the drink so I bought another and works wonders",
    author: "Madison",
    date: "February 10, 2026",
  },
  {
    stars: 5,
    title: "Works Perfectly!",
    body: "Amazing! Worked perfectly as suspected I tasted it for a millisecond and after that only the fruit juice lol amazing product 10/10 would recommend!",
    author: "Powerful Princess Paris",
    date: "March 26, 2026",
  },
  {
    stars: 4,
    title: "Didn’t work as expected",
    body: "It was ok, it’s nothing life changing. Still tasted alcohol.",
    author: "Jazmine",
    date: "July 20, 2023",
  },
  {
    stars: 3,
    title: "The 2.0 is better lol",
    body: "Works well easy to use. Kinda spendy. And will get mold in the silicone if not cleaned properly",
    author: "Caitlyn Elliott",
    date: "April 3, 2026",
  },
  {
    stars: 5,
    title: "Lots of fun!!",
    body: "Love it. Exactly as advertised. I would fill only half to 3/4 full with your favorite adult beverage. Then use your favorite chaser. Really easy to use. Does not leak. Very easy to clean. You will definitely have fun using it.",
    author: "Corey H.",
    date: "August 2, 2025",
  },
  {
    stars: 5,
    title: "Perfect!",
    body: "If you don’t do well with taking shots, this straw is great! I love it!",
    author: "Kelsey Ann King",
    date: "September 11, 2025",
  },
];

async function getMoreGifts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .limit(4);
  return (data as Product[]) ?? [];
}

export default async function HomePage() {
  const moreGifts = await getMoreGifts();

  return (
    <>
      {/* ── Hero: The Product ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <ProductGallery images={PRODUCT.images} productName={PRODUCT.name} />

        <div className="min-w-0">
          <span className="tag mb-5 inline-block">Introducing</span>
          <h1 className="headline mb-5">
            {PRODUCT.tagline.split(" ").slice(0, 2).join(" ")}
            <br />
            {PRODUCT.tagline.split(" ").slice(2).join(" ")}
          </h1>
          <p className="text-lg text-[#1A1A1A]/70 max-w-md mb-6 leading-relaxed">
            {PRODUCT.description}
          </p>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1 text-[#FF6B35]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(PRODUCT.rating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="text-sm text-[#1A1A1A]/60 font-medium">
              {PRODUCT.rating} · {PRODUCT.reviewCount}+ reviews
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-3xl font-black">${PRODUCT.price.toFixed(2)}</span>
            <span className="text-sm text-[#1A1A1A]/50 font-medium">{PRODUCT.color} · 1oz</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <HomeBuyButton
              name={PRODUCT.name}
              price={PRODUCT.price}
              photoUrl={PRODUCT.images[0]}
              className="btn-primary text-base flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            />
            <a href="#how-it-works" className="btn-ghost text-base">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="bg-[#05171B]">
        {/* Mobile: image on top, copy below (an overlay band crops badly at narrow widths) */}
        <div className="md:hidden">
          <div className="relative w-full aspect-[4/3]">
            <Image src={BRAND_STORY.image} alt={BRAND_STORY.title} fill className="object-cover" sizes="100vw" />
          </div>
          <div className="px-4 py-10">
            <span className="text-[#FF6B35] font-bold text-xs uppercase tracking-widest mb-3 block">
              {BRAND_STORY.eyebrow}
            </span>
            <h2 className="text-white font-black text-2xl uppercase leading-tight mb-3">{BRAND_STORY.title}</h2>
            <p className="text-white/80 leading-relaxed text-sm">{BRAND_STORY.body}</p>
          </div>
        </div>

        {/* Desktop: full-bleed overlay */}
        <div className="hidden md:block relative w-full aspect-[32/9] min-h-[380px]">
          <Image src={BRAND_STORY.image} alt={BRAND_STORY.title} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
            <div className="max-w-lg">
              <span className="text-[#FF6B35] font-bold text-xs uppercase tracking-widest mb-3 block">
                {BRAND_STORY.eyebrow}
              </span>
              <h2 className="text-white font-black text-4xl uppercase leading-tight mb-4">{BRAND_STORY.title}</h2>
              <p className="text-white/80 leading-relaxed text-base">{BRAND_STORY.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#EDEBE5] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="headline text-center mb-8 md:mb-10 text-2xl md:text-4xl">
            Why You&apos;ll Love the Take
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-6 flex flex-col gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}
                >
                  <f.icon size={20} />
                </div>
                <h3 className="font-black text-base uppercase tracking-tight">{f.title}</h3>
                <p className="text-sm text-[#1A1A1A]/65 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Carousel ── */}
      <BrandCarousel slides={lifestyle} />

      {/* ── Product Description ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="headline text-center mb-3 text-2xl md:text-4xl">Inside the Take</h2>
        <p className="text-center text-[#1A1A1A]/70 text-base md:text-lg mb-8 md:mb-12 max-w-xl mx-auto">
          Simple to fill, impossible to spill. Here&apos;s exactly what makes it work.
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-10 md:mb-16">
          <div className="card p-4">
            <div className="relative aspect-[970/600] rounded-xl overflow-hidden bg-white">
              <Image
                src={productDetails.diagram}
                alt="Diagram of the Take's features"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <ul className="flex flex-col gap-4">
            {productDetails.specs.map((spec) => (
              <li key={spec} className="flex items-start gap-3">
                <span
                  className="mt-1 w-2 h-2 rounded-full shrink-0"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}
                />
                <span className="text-[#1A1A1A]/75 leading-relaxed">{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[970/600] sm:aspect-[970/400] rounded-3xl overflow-hidden">
          <Image
            src={productDetails.caseImage}
            alt="TakeShots waterproof carrying case"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="headline text-center mb-3 text-2xl md:text-4xl">How It Works</h2>
        <p className="text-center text-[#1A1A1A]/70 text-base md:text-lg mb-8 md:mb-12 max-w-xl mx-auto">
          Three steps between you and the smoothest shot you&apos;ve ever taken.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <span className="block text-5xl font-black text-[#FF6B35]/25 mb-3">{s.step}</span>
              <h3 className="font-black text-lg uppercase mb-2">{s.title}</h3>
              <p className="text-sm text-[#1A1A1A]/65 leading-relaxed max-w-xs mx-auto">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="bg-[#EDEBE5] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="headline text-center mb-3 text-2xl md:text-4xl">What People Are Saying</h2>
          <p className="text-center text-[#1A1A1A]/70 text-base md:text-lg mb-8 md:mb-12">
            {PRODUCT.rating} · {PRODUCT.reviewCount}+ ratings on Amazon
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.title} className="card p-6 flex flex-col gap-3">
                <div className="flex items-center gap-1 text-[#FF6B35]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < r.stars ? "currentColor" : "none"} />
                  ))}
                </div>
                <h3 className="font-black text-base leading-snug">{r.title}</h3>
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed flex-1">{r.body}</p>
                <div className="text-xs text-[#1A1A1A]/50 font-medium pt-2 border-t border-[#EDEBE5]">
                  {r.author} · {r.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── More Gifts ── */}
      {moreGifts.length > 0 && (
        <section className="bg-[#EDEBE5] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <h2 className="headline text-2xl md:text-4xl">More Gifts You&apos;ll Love</h2>
              <Link href="/shop" className="text-[#FF6B35] font-bold text-sm uppercase tracking-wide hover:opacity-70 transition-opacity">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moreGifts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Notify / Email Capture ── */}
      <section id="notify" className="py-12 md:py-16" style={{ background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="headline text-white mb-3">Get Your Take V2</h2>
          <p className="text-white/80 text-base md:text-lg mb-6 md:mb-8">
            ${PRODUCT.price.toFixed(2)} · Ships to the US &amp; Canada. Checkout is quick, secure, and powered by Stripe.
          </p>
          <div className="flex justify-center mb-8">
            <HomeBuyButton
              name={PRODUCT.name}
              price={PRODUCT.price}
              photoUrl={PRODUCT.images[0]}
              className="btn-primary text-base bg-white !text-[#FF4500] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-white/70 text-sm mb-3">Or drop your email for launch updates &amp; deals:</p>
          <div className="flex justify-center">
            <EmailCapture source="hero" dark />
          </div>
        </div>
      </section>
    </>
  );
}
