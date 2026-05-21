import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();

  if (!email || !source) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;
  const { error } = await admin
    .from("email_subscribers")
    .upsert({ email, source, discount_claimed: false }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
