"use client";

import Link from "next/link";
import { usePlayers, type GameDoc } from "@/lib/playGame";

export default function Ended({ code }: { game: GameDoc; code: string }) {
  const players = usePlayers(code);
  const ranked = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm text-center">
        <span className="text-6xl mb-4 block">🏆</span>
        <h1 className="headline text-3xl mb-8">Final Scores</h1>

        <div className="flex flex-col gap-2 mb-10">
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={`card px-4 py-3 flex items-center justify-between ${
                i === 0 ? "border-2 border-[#FF6B35]" : ""
              }`}
            >
              <span className="font-bold text-sm">
                {i === 0 ? "👑 " : ""}
                {p.name}
              </span>
              <span className="tag">{p.score} pts</span>
            </div>
          ))}
        </div>

        <Link href="/play/create" className="btn-primary">
          Play Again
        </Link>
      </div>
    </div>
  );
}
