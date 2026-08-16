"use client";

import { useEffect, useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateGameCode } from "@/lib/gameCode";
import { pickPrompts } from "@/lib/prompts";
import { getPlayerId } from "@/lib/playerId";

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
}

export interface GameDoc {
  code: string;
  status: "lobby" | "playing" | "reveal" | "ended";
  roundLength: number;
  currentPromptIndex: number;
  prompts: string[];
  hostPlayerId: string;
}

export interface RoundVote {
  voterId: string;
  votedForPlayerId: string;
}

export async function createGame(roundLength: number, hostName: string) {
  const code = generateGameCode();
  const hostId = getPlayerId();

  await setDoc(doc(db, "games", code), {
    code,
    status: "lobby",
    roundLength,
    currentPromptIndex: 0,
    prompts: pickPrompts(roundLength),
    hostPlayerId: hostId,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "games", code, "players", hostId), {
    name: hostName,
    joinedAt: serverTimestamp(),
    score: 0,
  });

  return code;
}

export async function joinGame(code: string, name: string) {
  const playerId = getPlayerId();
  await setDoc(doc(db, "games", code, "players", playerId), {
    name,
    joinedAt: serverTimestamp(),
    score: 0,
  });
}

export async function startGame(code: string) {
  await updateDoc(doc(db, "games", code), { status: "playing", currentPromptIndex: 0 });
  await setDoc(doc(db, "games", code, "rounds", "0"), {
    promptIndex: 0,
    votesIn: 0,
    revealed: false,
  });
}

export async function castVote(gameCode: string, promptIndex: number, votedForPlayerId: string) {
  const voterId = getPlayerId();
  await setDoc(
    doc(db, "games", gameCode, "rounds", String(promptIndex), "votes", voterId),
    { votedForPlayerId, votedAt: serverTimestamp() }
  );
}

export async function tallyAndReveal(gameCode: string, promptIndex: number) {
  const votesSnap = await getDocs(
    collection(db, "games", gameCode, "rounds", String(promptIndex), "votes")
  );
  const tally: Record<string, number> = {};
  votesSnap.forEach((v) => {
    const votedFor = v.data().votedForPlayerId;
    tally[votedFor] = (tally[votedFor] || 0) + 1;
  });
  const winnerId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (winnerId) {
    const playerRef = doc(db, "games", gameCode, "players", winnerId);
    const snap = await getDoc(playerRef);
    await updateDoc(playerRef, { score: (snap.data()?.score ?? 0) + 1 });
  }
  await updateDoc(doc(db, "games", gameCode, "rounds", String(promptIndex)), { revealed: true });
  return tally;
}

export async function nextPrompt(gameCode: string, nextIndex: number, roundLength: number) {
  if (nextIndex >= roundLength) {
    await updateDoc(doc(db, "games", gameCode), { status: "ended" });
    return;
  }
  await updateDoc(doc(db, "games", gameCode), { currentPromptIndex: nextIndex });
  await setDoc(doc(db, "games", gameCode, "rounds", String(nextIndex)), {
    promptIndex: nextIndex,
    votesIn: 0,
    revealed: false,
  });
}

export function useGame(gameCode: string) {
  const [game, setGame] = useState<GameDoc | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!gameCode) return;
    return onSnapshot(doc(db, "games", gameCode), (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setGame(null);
        return;
      }
      setGame(snap.data() as GameDoc);
    });
  }, [gameCode]);

  return { game, notFound };
}

export function usePlayers(gameCode: string) {
  const [players, setPlayers] = useState<GamePlayer[]>([]);

  useEffect(() => {
    if (!gameCode) return;
    const q = query(collection(db, "games", gameCode, "players"), orderBy("joinedAt"));
    return onSnapshot(q, (snap) => {
      setPlayers(
        snap.docs.map((d) => ({ id: d.id, name: d.data().name, score: d.data().score ?? 0 }))
      );
    });
  }, [gameCode]);

  return players;
}

export function useRound(gameCode: string, promptIndex: number) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!gameCode) return;
    setRevealed(false);
    return onSnapshot(doc(db, "games", gameCode, "rounds", String(promptIndex)), (snap) => {
      setRevealed(!!snap.data()?.revealed);
    });
  }, [gameCode, promptIndex]);

  return { revealed };
}

export function useVotes(gameCode: string, promptIndex: number) {
  const [votes, setVotes] = useState<RoundVote[]>([]);

  useEffect(() => {
    if (!gameCode && gameCode !== "") return;
    const q = collection(db, "games", gameCode, "rounds", String(promptIndex), "votes");
    return onSnapshot(q, (snap) => {
      setVotes(
        snap.docs.map((d) => ({ voterId: d.id, votedForPlayerId: d.data().votedForPlayerId }))
      );
    });
  }, [gameCode, promptIndex]);

  return votes;
}
