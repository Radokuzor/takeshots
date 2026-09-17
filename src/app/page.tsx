import type { Metadata } from "next";
import Image from "next/image";
import { Star, Zap, ShieldCheck, MapPin, Sparkles, Check, Lock, Truck, Leaf, Plus } from "lucide-react";
import EmailCapture from "@/components/EmailCapture";
import ProductGallery from "@/components/ProductGallery";
import BrandCarousel from "@/components/BrandCarousel";
import HomeBuyButton from "@/components/HomeBuyButton";
import ReviewMarquee from "@/components/ReviewMarquee";
import StickyBuyBar from "@/components/StickyBuyBar";

export const metadata: Metadata = {
  title: "The Take V2 — Shot Holder & Straw | TakeShots",
  description:
    "Meet the Take V2: a shot holder & straw that turns every shot into a smooth, no-spill chaser. Fits any bottle or glass. Take your next party to the next level.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Take V2 — Shot Holder & Straw | TakeShots",
    description:
      "A patented shot holder & straw that makes the leap from shot to chaser seamless. No spills, no burn, no fumbling.",
    images: [
      {
        url: "https://m.media-amazon.com/images/I/71193Q2smAL._AC_SL1500_.jpg",
        width: 1500,
        height: 1500,
        alt: "The Take V2 shot holder and straw",
      },
    ],
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

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: PRODUCT.name,
  description: PRODUCT.description,
  image: PRODUCT.images,
  brand: { "@type": "Brand", name: "TakeShots" },
  offers: {
    "@type": "Offer",
    url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://takeshots.com") + "/",
    priceCurrency: "USD",
    price: PRODUCT.price.toFixed(2),
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: PRODUCT.rating,
    reviewCount: PRODUCT.reviewCount,
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: r.stars, bestRating: 5 },
    author: { "@type": "Person", name: r.author },
    name: r.title,
    reviewBody: r.body,
  })),
};

const faqs = [
  {
    q: "How much does the Take hold?",
    a: "Each Take securely holds 1 fl oz. For the smoothest pour, fill it about half to three-quarters full, then drop it into your chaser.",
  },
  {
    q: "Will it leak in my bag?",
    a: "A twistable cap seals it shut and a one-way valve lets liquid flow through the straw, never back out, so it's ready to toss in a bag, purse, or golf bag.",
  },
  {
    q: "What drinks and glasses does it work with?",
    a: "It's built to fit standard bottles and drink glasses. Use any chaser or mixed drink you like. It's not just for alcohol either: people use it for wellness shots and bitter supplements too.",
  },
  {
    q: "What is it made of?",
    a: "BPA-free, medical-grade Tritan. It's reusable and refillable, so you're not burning through single-use plastic every party.",
  },
  {
    q: "How do I keep it clean?",
    a: "Unscrew the lid and rinse it out after each use, especially after pulpy or sugary drinks, and let it dry fully before sealing it back up.",
  },
  {
    q: "Where do you ship?",
    a: "We ship to the US and Canada. Checkout is handled securely by Stripe, so your card details never touch our servers.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const heroBullets = ["Shot + chaser in one sip", "No-spill seal & one-way valve", "Fits any standard bottle or glass"];

const trustBadges = [
  { icon: Truck, label: "Ships to US & Canada" },
  { icon: Lock, label: "Secure Stripe checkout" },
  { icon: Leaf, label: "BPA-free & reusable" },
];

const occasions = [
  "Game Days",
  "Beach Trips",
  "Pool Parties",
  "Tailgates",
  "Birthdays",
  "Festivals",
  "Bachelorettes",
  "Wellness Shots",
];

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-coral" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return <Star key={i} size={size} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.5} />;
      })}
    </div>
  );
}

function FeatureIcon({ icon: Icon }: { icon: typeof Zap }) {
  return (
    <span className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-coral to-coral-deep text-white flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(255,69,0,0.7)]">
      <Icon size={22} />
    </span>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
      <span className="eyebrow mb-3">{eyebrow}</span>
      <h2 className="headline text-[2rem] md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-base md:text-lg text-ink/65">{sub}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── Hero / buy box ── */}
      <section id="buy" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-coral/15 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-14 md:pt-14 md:pb-24 grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <ProductGallery images={PRODUCT.images} productName={PRODUCT.name} />

          <div className="min-w-0">
            <a href="#reviews" className="inline-flex flex-wrap items-center gap-2 mb-5 group">
              <Stars rating={PRODUCT.rating} />
              <span className="text-sm font-semibold text-ink/70 group-hover:text-ink">
                {PRODUCT.rating} · {PRODUCT.reviewCount}+ reviews
              </span>
            </a>

            <h1 className="headline text-[2.6rem] sm:text-6xl lg:text-7xl mb-5">
              Take Shots{" "}
              <span className="bg-gradient-to-r from-coral to-coral-deep bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>

            <p className="text-base sm:text-lg text-ink/70 max-w-lg mb-6 leading-relaxed">
              The patented shot holder &amp; straw that takes you from shot to chaser in one smooth sip. No fumbling,
              no spilling, no lingering burn.
            </p>

            <ul className="grid gap-2.5 mb-7">
              {heroBullets.map((b) => (
                <li key={b} className="flex items-center gap-3 font-medium">
                  <span className="w-6 h-6 rounded-full bg-coral/15 text-coral-deep flex items-center justify-center shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="rounded-3xl bg-white border border-ink/5 p-5 sm:p-6 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.12)]">
              <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-1">
                    Take V2 · {PRODUCT.color}<span className="hidden sm:inline"> · 1 fl oz</span>
                  </p>
                  <p className="font-display text-4xl font-extrabold tracking-tight">${PRODUCT.price.toFixed(2)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> In stock
                </span>
              </div>
              <HomeBuyButton
                name={PRODUCT.name}
                price={PRODUCT.price}
                photoUrl={PRODUCT.images[0]}
                className="btn-primary text-base disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-ink/5">
                {trustBadges.map((t) => (
                  <div key={t.label} className="flex flex-col items-center text-center gap-1.5">
                    <t.icon size={18} className="text-coral-deep" />
                    <span className="text-[11px] sm:text-xs font-semibold text-ink/60 leading-tight">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Occasion ticker ── */}
      <div className="overflow-hidden py-2">
        <div className="marquee overflow-hidden bg-gradient-to-r from-coral to-coral-deep text-white py-4 -rotate-1 -mx-4">
          <div className="marquee-track" style={{ "--marquee-duration": "30s" } as React.CSSProperties}>
            {[...occasions, ...occasions].map((o, i) => (
              <span
                key={i}
                aria-hidden={i >= occasions.length || undefined}
                className="flex items-center gap-10 pr-10 font-display font-extrabold uppercase text-lg sm:text-xl tracking-tight whitespace-nowrap"
              >
                {o} <Sparkles size={16} className="opacity-70" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Brand Story ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <div className="relative rounded-[2rem] overflow-hidden bg-teal-night">
          <div className="relative w-full aspect-[16/10] md:aspect-[32/11]">
            <Image
              src={BRAND_STORY.image}
              alt={BRAND_STORY.title}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/0" />
          </div>
          <div className="md:absolute md:inset-0 flex items-center">
            <div className="p-6 sm:p-8 md:p-14 max-w-xl">
              <span className="eyebrow !text-coral mb-3">{BRAND_STORY.eyebrow}</span>
              <h2 className="headline !text-white text-3xl md:text-5xl mb-4">{BRAND_STORY.title}</h2>
              <p className="text-white/75 leading-relaxed">{BRAND_STORY.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (bento) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow="Why the Take"
          title="Why You'll Love It"
          sub="Designed around one job: making every shot go down smooth."
        />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
          <div className="md:col-span-3 md:row-span-2 rounded-[2rem] bg-white border border-ink/5 overflow-hidden flex flex-col">
            <div className="p-6 md:p-8">
              <FeatureIcon icon={features[0].icon} />
              <h3 className="font-display font-extrabold text-2xl md:text-3xl uppercase tracking-tight mt-4 mb-2">
                {features[0].title}
              </h3>
              <p className="text-ink/65 leading-relaxed max-w-md">{features[0].body}</p>
            </div>
            <div className="relative flex-1 min-h-[220px] md:min-h-[260px]">
              <Image
                src={productDetails.diagram}
                alt="Diagram of the Take's features"
                fill
                className="object-contain px-4 pb-4"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          </div>
          {features.slice(1).map((f, i) => (
            <div
              key={f.title}
              className={`rounded-[2rem] p-6 md:p-7 flex flex-col gap-4 ${
                i === 0 ? "bg-ink text-white" : "bg-white border border-ink/5"
              } ${i === 2 ? "md:col-span-5 md:flex-row md:items-center md:gap-6" : "md:col-span-2"}`}
            >
              <FeatureIcon icon={f.icon} />
              <div>
                <h3 className="font-display font-extrabold text-xl uppercase tracking-tight mb-1.5">{f.title}</h3>
                <p className={`text-sm leading-relaxed ${i === 0 ? "text-white/70" : "text-ink/65"}`}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Carousel ── */}
      <BrandCarousel slides={lifestyle} />

      {/* ── How It Works ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow="Easy as 1-2-3"
          title="How It Works"
          sub="Three steps between you and the smoothest shot you've ever taken."
        />
        <div className="relative">
          <div
            aria-hidden
            className="hidden md:block absolute top-16 left-[17%] right-[17%] border-t-2 border-dashed border-coral/40"
          />
          <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {steps.map((s) => (
              <li
                key={s.step}
                className="rounded-[2rem] bg-white border border-ink/5 p-6 md:p-8 flex md:flex-col items-start md:items-center md:text-center gap-5"
              >
                <span className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-coral to-coral-deep text-white font-display font-extrabold text-xl md:text-2xl flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(255,69,0,0.7)]">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-xl uppercase tracking-tight mb-1.5">{s.title}</h3>
                  <p className="text-sm text-ink/65 leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Inside the Take ── */}
      <section className="bg-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[970/600] rounded-[2rem] overflow-hidden order-2 md:order-1">
            <Image
              src={productDetails.caseImage}
              alt="TakeShots waterproof carrying case"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="eyebrow mb-3">The Details</span>
            <h2 className="headline text-[2rem] md:text-5xl mb-4">Inside the Take</h2>
            <p className="text-ink/65 text-base md:text-lg mb-8">
              Simple to fill, impossible to spill. Here&apos;s exactly what makes it work.
            </p>
            <ul className="grid gap-3">
              {productDetails.specs.map((spec) => (
                <li key={spec} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3.5 border border-ink/5">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-coral to-coral-deep text-white flex items-center justify-center shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-ink/80 font-medium leading-relaxed">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <span className="eyebrow mb-3">Reviews</span>
            <h2 className="headline text-[2rem] md:text-5xl">What People Are Saying</h2>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-3xl border border-ink/5 px-5 py-4 self-start md:self-auto">
            <p className="font-display text-5xl font-extrabold leading-none">{PRODUCT.rating}</p>
            <div>
              <Stars rating={PRODUCT.rating} size={16} />
              <p className="text-sm text-ink/55 mt-1">{PRODUCT.reviewCount}+ ratings on Amazon</p>
            </div>
          </div>
        </div>
        <ReviewMarquee reviews={reviews} />
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
        <SectionHeading eyebrow="FAQ" title="Questions? Answered." />
        <div className="grid gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group bg-white rounded-2xl border border-ink/5 open:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-shadow"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 md:px-6 md:py-5 font-bold text-base md:text-lg">
                {f.q}
                <span className="faq-icon shrink-0 w-8 h-8 rounded-full bg-cream flex items-center justify-center transition-transform group-open:bg-coral group-open:text-white">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="px-5 pb-5 md:px-6 md:pb-6 -mt-1 text-ink/65 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="notify" className="px-4 sm:px-6 pb-20 md:pb-28">
        <div className="relative max-w-7xl mx-auto rounded-[2rem] overflow-hidden bg-gradient-to-br from-coral to-coral-deep">
          <div aria-hidden className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid md:grid-cols-[1.2fr_1fr] items-stretch">
            <div className="p-7 sm:p-10 md:p-14 text-white">
              <h2 className="headline !text-white text-4xl md:text-6xl mb-4">Get Your Take V2</h2>
              <p className="text-white/85 text-base md:text-lg mb-7 max-w-md">
                {`$${PRODUCT.price.toFixed(2)} · `}Ships to the US &amp; Canada. Checkout is quick, secure, and powered by
                Stripe.
              </p>
              <HomeBuyButton
                onDark
                name={PRODUCT.name}
                price={PRODUCT.price}
                photoUrl={PRODUCT.images[0]}
                className="btn-primary text-base !bg-none !bg-white !text-coral-deep disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <div className="mt-8 pt-7 border-t border-white/20">
                <p className="text-white/85 text-sm font-semibold mb-3">Not ready yet? Get launch updates &amp; deals:</p>
                <EmailCapture source="hero" dark />
              </div>
            </div>
            <div className="relative hidden md:block min-h-[420px]">
              <Image
                src={lifestyle[0].image}
                alt="The Take V2 on game day"
                fill
                className="object-cover"
                sizes="40vw"
              />
            </div>
          </div>
        </div>
      </section>

      <StickyBuyBar
        name={PRODUCT.name}
        price={PRODUCT.price}
        photoUrl={PRODUCT.images[0]}
        startId="buy"
        endId="notify"
      />
    </>
  );
}
