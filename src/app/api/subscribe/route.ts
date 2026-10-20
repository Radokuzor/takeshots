import { NextRequest, NextResponse } from "next/server";
import { SUBSCRIBERS_COLLECTION, adminDb } from "@/lib/firebaseAdmin";

const SOURCES = ["hero", "popup", "footer", "play_page"];

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();

  if (typeof email !== "string" || !/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(email.trim()) || !SOURCES.includes(source)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const id = email.trim().toLowerCase();
  try {
    const ref = adminDb().collection(SUBSCRIBERS_COLLECTION).doc(id);
    // Keep the original signup date and source if they re-subscribe.
    await ref.create({ id, email: id, source, discount_claimed: false, created_at: new Date().toISOString() });
  } catch (err) {
    if ((err as { code?: number }).code !== 6) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
