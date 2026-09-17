import type { Metadata } from "next";
import Link from "next/link";
import { Users, Smartphone, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Most Likely To — Play with Friends",
  description: "Fire up a live round of Most Likely To with your group. No app, no sign-in — just a game code.",
  alternates: {
    canonical: "/play",
  },
};

const steps = [
  { icon: Users, title: "Host a game", body: "Enter your name and get a game code in seconds." },
  { icon: Smartphone, title: "Friends join", body: "Everyone joins from their own phone. No app, no sign-in." },
  { icon: Trophy, title: "Vote & reveal", body: "Vote on each prompt and watch the results roll in live." },
];

export default function PlayPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-20 md:pb-28">
      <section className="relative overflow-hidden rounded-[2rem] bg-teal-night text-white px-6 py-14 md:py-24 text-center">
        <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-coral/25 blur-3xl" />
        <div className="relative">
          <span className="tag mb-6">Free party game</span>
          <h1 className="headline !text-white text-5xl sm:text-7xl mb-5">
            Most Likely <span className="text-coral">To…</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-md mx-auto mb-9">
            Start a round, share the code, and see who your friends really think is most likely to… everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
            <Link href="/play/create" className="btn-primary">
              Host a Game
            </Link>
            <Link href="/play/join" className="btn-ghost !border-white !text-white hover:!bg-white hover:!text-ink">
              Join a Game
            </Link>
          </div>
        </div>
      </section>

      <ol className="grid sm:grid-cols-3 gap-4 mt-4">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-[2rem] bg-white border border-ink/5 p-6 md:p-8 flex items-start gap-4">
            <span className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-coral to-coral-deep text-white flex items-center justify-center">
              <s.icon size={22} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink/40 mb-0.5">Step {i + 1}</p>
              <h2 className="font-display font-extrabold text-lg uppercase tracking-tight mb-1">{s.title}</h2>
              <p className="text-sm text-ink/65 leading-relaxed">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
