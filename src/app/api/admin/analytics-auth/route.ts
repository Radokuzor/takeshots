import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_COOKIE, analyticsPassword, analyticsToken } from "@/lib/analyticsServer";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: null }));
  if (password !== analyticsPassword()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ANALYTICS_COOKIE, analyticsToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ANALYTICS_COOKIE);
  return res;
}
