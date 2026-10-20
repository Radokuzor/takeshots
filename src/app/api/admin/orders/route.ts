import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ORDERS_COLLECTION, adminDb } from "@/lib/firebaseAdmin";

const STATUSES = ["pending", "fulfilled", "cancelled"] as const;

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await adminDb().collection(ORDERS_COLLECTION).doc(String(id)).update({ status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
