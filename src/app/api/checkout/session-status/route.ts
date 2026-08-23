import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const paymentIntentId = req.nextUrl.searchParams.get("payment_intent");
  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing payment_intent" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return NextResponse.json({
    status: paymentIntent.status,
    customerEmail: paymentIntent.receipt_email ?? null,
  });
}
