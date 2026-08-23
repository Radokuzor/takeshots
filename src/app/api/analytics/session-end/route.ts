import { NextRequest, NextResponse } from "next/server";
import { notifyTelegram } from "@/lib/telegram";

interface PageVisit {
  path: string;
  enteredAt: number;
  exitedAt: number | null;
  maxScrollPct: number;
}

interface SessionEndPayload {
  sessionId?: string;
  pages?: PageVisit[];
  startedAt?: number;
  endedAt?: number;
  referrer?: string | null;
  purchased?: boolean;
}

export async function POST(req: NextRequest) {
  let body: SessionEndPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pages = (body.pages ?? []).filter((p) => p.path);
  if (pages.length === 0 || !body.startedAt || !body.endedAt) {
    return NextResponse.json({ ok: true });
  }

  const durationMs = Math.max(0, body.endedAt - body.startedAt);
  const maxScrollPct = Math.max(0, ...pages.map((p) => p.maxScrollPct ?? 0));
  const reachedCheckout = pages.some((p) => p.path === "/checkout");
  const purchased = !!body.purchased;

  // Skip near-instant single-page bounces (bots, prefetches) — not worth a notification.
  if (durationMs < 3000 && pages.length <= 1 && maxScrollPct < 10) {
    return NextResponse.json({ ok: true });
  }

  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.round((durationMs % 60000) / 1000);
  const durationText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  const pathChain = pages.map((p) => p.path).join(" → ");

  const lines = [
    reachedCheckout && !purchased ? "⚠️ *Checkout abandoned*" : "👀 *Visitor session*",
    `Duration: ${durationText}`,
    `Pages (${pages.length}): ${pathChain}`,
    `Max scroll: ${maxScrollPct}%`,
  ];
  if (body.referrer) lines.push(`Referrer: ${body.referrer}`);

  await notifyTelegram(lines.join("\n"));

  return NextResponse.json({ ok: true });
}
