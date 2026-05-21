import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "TakeShots — built for people who take gift-giving seriously and celebrating even more seriously.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="headline mb-8">About TakeShots</h1>

      <div className="flex flex-col gap-6 text-[#1A1A1A]/80 text-lg leading-relaxed">
        <p>
          TakeShots started with one idea: gifting should be fun, not stressful. We&apos;ve all been there —
          staring at a browser tab at 11pm, no clue what to get, settling for something generic.
        </p>
        <p>
          We built TakeShots to fix that. Every product in our shop is hand-picked for a specific occasion —
          bachelorette parties, birthdays, anniversaries, game nights, weddings, and holidays. No noise, just
          the good stuff.
        </p>
        <p>
          And while you&apos;re here, play our game. It&apos;s free, it&apos;s wild, and your group chat will
          not stop talking about it.
        </p>

        <p className="font-black text-[#FF6B35] text-xl">
          Gifts, games, and good times. That&apos;s TakeShots.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link href="/shop" className="btn-primary">Shop Gifts</Link>
        <Link href="/play" className="btn-ghost">Play the Game</Link>
      </div>
    </div>
  );
}
