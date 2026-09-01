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

    // Shipping details are attached to the PaymentIntent by the checkout's
    // Stripe AddressElement (mode: "shipping") at confirm time. Fall back to the
    // charge's billing details for the name if shipping is somehow missing.
    let shipping = paymentIntent.shipping;
    let email = paymentIntent.receipt_email;
    if (!shipping || !email) {
      try {
        const full = await stripe.paymentIntents.retrieve(paymentIntent.id, {
          expand: ["latest_charge"],
        });
        shipping = shipping ?? full.shipping;
        const charge = full.latest_charge as Stripe.Charge | null;
        shipping = shipping ?? charge?.shipping ?? null;
        email = email ?? charge?.billing_details?.email ?? null;
      } catch {
        // best-effort — fall through with whatever we have
      }
    }

    const addr = shipping?.address;

    const { error } = await supabaseAdmin().from("orders").insert({
      customer_email: email ?? "unknown",
      customer_name: shipping?.name ?? null,
      phone: shipping?.phone ?? null,
      shipping: addr
        ? {
            line1: addr.line1 ?? null,
            line2: addr.line2 ?? null,
            city: addr.city ?? null,
            state: addr.state ?? null,
            postal_code: addr.postal_code ?? null,
            country: addr.country ?? null,
          }
        : null,
      stripe_payment_id: paymentIntent.id,
      items,
      total: paymentIntent.amount / 100,
      status: "pending",
    });

    if (error && error.code !== "23505") {
      // 23505 = unique violation on stripe_payment_id (duplicate webhook delivery) — safe to ignore
      console.error("Failed to save order:", error);
      await notifyTelegram(
        `⚠️ *Order save FAILED* for ${paymentIntent.id}\n${error.message}\nCheck Supabase — payment went through but the order row was not written.`
      );
    }

    const itemLines = items
      .map((i: { name: string; quantity: number }) => `• ${i.quantity}x ${i.name}`)
      .join("\n");

    const shipLine = addr
      ? `\n${shipping?.name ?? ""}\n${[addr.line1, addr.line2].filter(Boolean).join(", ")}\n${[addr.city, addr.state, addr.postal_code].filter(Boolean).join(" ")}`
      : "";

    await notifyTelegram(
      `🎉 *New order!*\n${email ?? "unknown"}\n$${(paymentIntent.amount / 100).toFixed(2)}\n${itemLines}${shipLine}`
    );
  }

  return NextResponse.json({ received: true });
}
