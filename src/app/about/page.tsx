import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "TakeShots makes the Take V2, a patented shot holder and straw that turns every shot into a smooth, no spill chaser.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="headline mb-8">About TakeShots</h1>

      <div className="flex flex-col gap-6 text-[#1A1A1A]/80 text-lg leading-relaxed">
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

        <p className="font-black text-[#FF6B35] text-xl">
          One straw. Every shot, smoother. That&apos;s TakeShots.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link href="/#notify" className="btn-primary">Get the Take V2</Link>
        <Link href="/#how-it-works" className="btn-ghost">See How It Works</Link>
      </div>
    </div>
  );
}
