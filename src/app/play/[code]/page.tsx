"use client";

import { use } from "react";
import { useGame, useRound } from "@/lib/playGame";
import Lobby from "./Lobby";
import Voting from "./Voting";
import Reveal from "./Reveal";
import Ended from "./Ended";

export default function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();
  const { game, notFound } = useGame(code);
  const { revealed } = useRound(code, game?.currentPromptIndex ?? 0);

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="headline text-3xl mb-4">Game not found</h1>
        <p className="text-[#1A1A1A]/60">Double-check the code and try again.</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-[#1A1A1A]/60">Loading...</p>
      </div>
    );
  }

  if (game.status === "lobby") return <Lobby game={game} code={code} />;
  if (game.status === "playing") {
    return revealed ? <Reveal game={game} code={code} /> : <Voting game={game} code={code} />;
  }
  if (game.status === "ended") return <Ended game={game} code={code} />;

  return null;
}
