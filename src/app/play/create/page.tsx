"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/lib/playGame";
import { trackEvent } from "@/lib/analytics";

export default function CreateGamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("loading");
    try {
      const code = await createGame(name.trim());
      trackEvent("game_created", { code });
      router.push(`/play/${code}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="card w-full max-w-sm p-8">
        <h1 className="headline text-3xl mb-6 text-center">Host a Game</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold mb-2">Your name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sam"
              className="w-full px-4 py-3 rounded-xl border border-[#EDEBE5] outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
          <p className="text-sm text-[#1A1A1A]/60">
            The game starts the moment you create it — share the code and friends
            can jump in whenever, no waiting room. Prompts keep coming until you
            end it.
          </p>
          <button type="submit" disabled={status === "loading"} className="btn-primary mt-2">
            {status === "loading" ? "Starting..." : "Start Game"}
          </button>
          {status === "error" && (
            <p className="text-red-500 text-xs text-center">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
