import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Most Likely To — Play with Friends",
  description: "Fire up a live round of Most Likely To with your group. No app, no sign-in — just a game code.",
};

export default function PlayPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <span className="text-6xl mb-6">🎉</span>
      <h1 className="headline mb-4">Most Likely To</h1>
      <p className="text-[#1A1A1A]/70 text-lg max-w-md mb-10">
        Start a round, share the code, and see who your friends really think is most likely to…
        everything.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/play/create" className="btn-primary">
          Host a Game
        </Link>
        <Link href="/play/join" className="btn-ghost">
          Join a Game
        </Link>
      </div>
    </div>
  );
}
