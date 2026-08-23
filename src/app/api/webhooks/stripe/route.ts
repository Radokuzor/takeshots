import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const items = session.metadata?.order_items
      ? JSON.parse(session.metadata.order_items)
      : [];

    const { error } = await supabaseAdmin().from("orders").insert({
      customer_email: session.customer_details?.email ?? "unknown",
      stripe_payment_id: session.id,
      items,
      total: (session.amount_total ?? 0) / 100,
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
      `🎉 *New order!*\n${session.customer_details?.email ?? "unknown"}\n$${((session.amount_total ?? 0) / 100).toFixed(2)}\n${itemLines}`
    );
  }

  return NextResponse.json({ received: true });
}
