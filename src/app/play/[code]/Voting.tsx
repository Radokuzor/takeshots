"use client";

import { useEffect, useState } from "react";
import { usePlayers, useVotes, castVote, tallyAndReveal, type GameDoc } from "@/lib/playGame";
import { getPlayerId } from "@/lib/playerId";

export default function Voting({ game, code }: { game: GameDoc; code: string }) {
  const players = usePlayers(code);
  const votes = useVotes(code, game.currentPromptIndex);
  const [revealing, setRevealing] = useState(false);
  const playerId = getPlayerId();
  const isHost = playerId === game.hostPlayerId;
  const myVote = votes.find((v) => v.voterId === playerId);
  const allVoted = players.length > 0 && votes.length >= players.length;

  useEffect(() => {
    if (isHost && allVoted && !revealing) {
      setRevealing(true);
      tallyAndReveal(code, game.currentPromptIndex).finally(() =>
        // reveal is picked up via the game doc listener in the parent page,
        // this local flag just prevents double-firing on the host's client
        setRevealing(false)
      );
    }
  }, [isHost, allVoted, revealing, code, game.currentPromptIndex]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <p className="text-sm font-bold text-[#1A1A1A]/60 text-center mb-2">
          PROMPT {game.currentPromptIndex + 1} OF {game.roundLength}
        </p>
        <h1 className="headline text-2xl text-center mb-8">
          {game.prompts[game.currentPromptIndex]}
        </h1>

        <div className="flex flex-col gap-3 mb-6">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => castVote(code, game.currentPromptIndex, p.id)}
              disabled={!!myVote}
              className={`card px-4 py-3 text-left font-bold text-sm border-2 transition ${
                myVote?.votedForPlayerId === p.id
                  ? "border-[#FF6B35]"
                  : "border-transparent"
              } ${myVote ? "opacity-60" : ""}`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-[#1A1A1A]/60">
          {votes.length} of {players.length} voted
        </p>
      </div>
    </div>
  );
}
