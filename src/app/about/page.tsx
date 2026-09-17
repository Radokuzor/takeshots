import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Target, FlaskConical, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "TakeShots makes the Take V2, a patented shot holder and straw that turns every shot into a smooth, no spill chaser.",
  alternates: {
    canonical: "/about",
  },
};

const values = [
  { icon: Target, title: "One product", body: "We designed one thing and put everything into getting it right." },
  { icon: FlaskConical, title: "Tested until it worked", body: "BPA-free, medical-grade Tritan and a seal that actually holds." },
  { icon: Package, title: "Straight to you", body: "We ship the Take V2 to your door anywhere in the US & Canada." },
];

export default function AboutPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-16 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="eyebrow mb-3">Our Story</span>
          <h1 className="headline text-5xl md:text-7xl mb-6">About TakeShots</h1>
          <div className="flex flex-col gap-5 text-ink/75 text-base md:text-lg leading-relaxed">
            <p>
              TakeShots is built around one product we actually believe in: the Take V2, a patented shot holder
              and straw that makes the leap from shot to chaser completely seamless. Fill it, drop it into your
              chaser or mixed drink, and take your shot. No fumbling, no spilling, no burn lingering longer than
              it has to.
            </p>
            <p>
              It came out of a simple frustration. Taking a shot and scrambling for a chaser is messy every
              single time, whether you&apos;re at a game day, a beach trip, a pool party, or just hanging out with
              friends. So we built a straw that solves it. BPA free, medical grade Tritan, small enough to live in
              your bag or your back pocket, and ready wherever the party ends up.
            </p>
            <p>
              We&apos;re not a gift shop and we&apos;re not a game. We&apos;re a small team that designed one
              product, tested it until it actually worked, and now ships it straight to your door.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-teal-night">
          <Image
            src="https://m.media-amazon.com/images/S/aplus-media-library-service-media/8173e5aa-1931-4973-b77b-3aa5b79424a7.__CR0,123,3000,3754_PT0_SX1000_V1___.jpg"
            alt="The Take V2 at a pool day"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-[2rem] bg-white border border-ink/5 p-6 md:p-8">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral to-coral-deep text-white flex items-center justify-center mb-4">
                <v.icon size={22} />
              </span>
              <h2 className="font-display font-extrabold text-xl uppercase tracking-tight mb-1.5">{v.title}</h2>
              <p className="text-sm text-ink/65 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-ink text-white p-8 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="headline !text-white text-3xl md:text-5xl max-w-2xl">
            One straw. Every shot, <span className="text-coral">smoother.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/#buy" className="btn-primary">Get the Take V2</Link>
            <Link href="/#how-it-works" className="btn-ghost !border-white !text-white hover:!bg-white hover:!text-ink">
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
