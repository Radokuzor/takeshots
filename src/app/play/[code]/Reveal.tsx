"use client";

import { usePlayers, useVotes, nextPrompt, type GameDoc } from "@/lib/playGame";
import { getPlayerId } from "@/lib/playerId";

export default function Reveal({ game, code }: { game: GameDoc; code: string }) {
  const players = usePlayers(code);
  const votes = useVotes(code, game.currentPromptIndex);
  const isHost = getPlayerId() === game.hostPlayerId;

  const tally: Record<string, number> = {};
  votes.forEach((v) => {
    tally[v.votedForPlayerId] = (tally[v.votedForPlayerId] || 0) + 1;
  });
  const ranked = players
    .map((p) => ({ ...p, votes: tally[p.id] ?? 0 }))
    .sort((a, b) => b.votes - a.votes);
  const topVotes = ranked[0]?.votes ?? 0;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <p className="text-sm font-bold text-[#1A1A1A]/60 text-center mb-2">RESULTS</p>
        <h1 className="headline text-2xl text-center mb-8">
          {game.prompts[game.currentPromptIndex]}
        </h1>

        <div className="flex flex-col gap-2 mb-8">
          {ranked.map((p) => (
            <div
              key={p.id}
              className={`card px-4 py-3 flex items-center justify-between ${
                p.votes === topVotes && topVotes > 0 ? "border-2 border-[#FF6B35]" : ""
              }`}
            >
              <span className="font-bold text-sm">{p.name}</span>
              <span className="tag">{p.votes} vote{p.votes === 1 ? "" : "s"}</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <button
            onClick={() => nextPrompt(code, game.currentPromptIndex + 1, game.roundLength)}
            className="btn-primary w-full"
          >
            {game.currentPromptIndex + 1 >= game.roundLength ? "See Final Scores" : "Next Prompt"}
          </button>
        ) : (
          <p className="text-sm text-[#1A1A1A]/60 text-center">
            Waiting for the host to continue...
          </p>
        )}
      </div>
    </div>
  );
}
