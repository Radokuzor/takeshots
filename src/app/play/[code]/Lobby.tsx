"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { usePlayers, startGame, type GameDoc } from "@/lib/playGame";
import { getPlayerId } from "@/lib/playerId";

export default function Lobby({ game, code }: { game: GameDoc; code: string }) {
  const players = usePlayers(code);
  const [copied, setCopied] = useState(false);
  const isHost = getPlayerId() === game.hostPlayerId;

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="card w-full max-w-sm p-8 text-center">
        <p className="text-sm font-bold text-[#1A1A1A]/60 mb-2">GAME CODE</p>
        <button
          onClick={copyCode}
          className="flex items-center justify-center gap-2 mx-auto mb-6 text-3xl font-black tracking-widest"
        >
          {code}
          {copied ? <Check size={20} className="text-green-600" /> : <Copy size={18} />}
        </button>

        <p className="text-sm font-bold mb-3">
          Players ({players.length})
        </p>
        <ul className="flex flex-col gap-2 mb-8">
          {players.map((p) => (
            <li
              key={p.id}
              className="px-4 py-2 rounded-xl bg-[#F5F4F0] font-bold text-sm flex items-center justify-between"
            >
              <span>{p.name}</span>
              {p.id === game.hostPlayerId && <span className="tag">HOST</span>}
            </li>
          ))}
        </ul>

        {isHost ? (
          <button
            onClick={() => startGame(code)}
            disabled={players.length < 2}
            className="btn-primary w-full disabled:opacity-40"
          >
            {players.length < 2 ? "Waiting for more players..." : "Start Game"}
          </button>
        ) : (
          <p className="text-sm text-[#1A1A1A]/60">Waiting for the host to start the game...</p>
        )}
      </div>
    </div>
  );
}
