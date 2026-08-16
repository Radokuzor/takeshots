"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { joinGame } from "@/lib/playGame";

export default function JoinGamePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "not_found" | "started" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    const normalizedCode = code.trim().toUpperCase();
    setStatus("loading");
    try {
      const snap = await getDoc(doc(db, "games", normalizedCode));
      if (!snap.exists()) {
        setStatus("not_found");
        return;
      }
      if (snap.data().status !== "lobby") {
        setStatus("started");
        return;
      }
      await joinGame(normalizedCode, name.trim());
      router.push(`/play/${normalizedCode}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="card w-full max-w-sm p-8">
        <h1 className="headline text-3xl mb-6 text-center">Join a Game</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold mb-2">Game code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SHOT4"
              maxLength={8}
              className="w-full px-4 py-3 rounded-xl border border-[#EDEBE5] outline-none focus:ring-2 focus:ring-[#FF6B35] uppercase tracking-widest text-center font-bold"
            />
          </div>
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
          <button type="submit" disabled={status === "loading"} className="btn-primary mt-2">
            {status === "loading" ? "Joining..." : "Join Game"}
          </button>
          {status === "not_found" && (
            <p className="text-red-500 text-xs text-center">No game found with that code.</p>
          )}
          {status === "started" && (
            <p className="text-red-500 text-xs text-center">That game has already started.</p>
          )}
          {status === "error" && (
            <p className="text-red-500 text-xs text-center">Something went wrong. Try again.</p>
          )}
        </form>
      </div>
    </div>
  );
}
