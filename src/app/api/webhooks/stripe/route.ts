import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyTelegram } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const items = paymentIntent.metadata?.order_items
      ? JSON.parse(paymentIntent.metadata.order_items)
      : [];

    const { error } = await supabaseAdmin().from("orders").insert({
      customer_email: paymentIntent.receipt_email ?? "unknown",
      stripe_payment_id: paymentIntent.id,
      items,
      total: paymentIntent.amount / 100,
      status: "pending",
    });

    if (error && error.code !== "23505") {
      // 23505 = unique violation on stripe_payment_id (duplicate webhook delivery) — safe to ignore
      console.error("Failed to save order:", error);
    }

    const itemLines = items
      .map((i: { name: string; quantity: number }) => `• ${i.quantity}x ${i.name}`)
      .join("\n");

    await notifyTelegram(
      `🎉 *New order!*\n${paymentIntent.receipt_email ?? "unknown"}\n$${(paymentIntent.amount / 100).toFixed(2)}\n${itemLines}`
    );
  }

  return NextResponse.json({ received: true });
}
