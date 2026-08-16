"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/lib/playGame";
import { ROUND_LENGTH_PRESETS } from "@/lib/prompts";

export default function CreateGamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roundLength, setRoundLength] = useState(ROUND_LENGTH_PRESETS[1].value);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("loading");
    try {
      const code = await createGame(roundLength, name.trim());
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
          <div>
            <label className="block text-sm font-bold mb-2">Round length</label>
            <div className="flex flex-col gap-2">
              {ROUND_LENGTH_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setRoundLength(preset.value)}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition ${
                    roundLength === preset.value
                      ? "border-[#FF6B35] bg-[#FF6B35]/10"
                      : "border-[#EDEBE5]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={status === "loading"} className="btn-primary mt-2">
            {status === "loading" ? "Creating..." : "Create Game"}
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
