import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";
import type { Attribution } from "@/lib/analytics";
import { getClientContext, referrerHost } from "@/lib/analyticsServer";

// Stripe metadata values are capped at 500 chars.
const meta = (v: unknown) => (v === null || v === undefined || v === "" ? "" : String(v).slice(0, 500));

export async function POST(req: NextRequest) {
  const { items, attribution }: { items: CartItem[]; attribution?: Attribution | null } = await req.json();

  const amount = items.reduce(
    (sum, item) => sum + Math.round(item.product.price * 100) * item.quantity,
    0
  );

  const order_items = items.map((item) => ({
    product_id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  // Buyer context, forwarded to the webhook so the order notification can
  // say where the sale came from.
  const ctx = getClientContext(req.headers);
  const a = attribution ?? null;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      order_items: JSON.stringify(order_items),
      ts_session_id: meta(a?.sessionId),
      ts_visitor_id: meta(a?.visitorId),
      ts_visit_number: meta(a?.visitNumber),
      ts_landing_page: meta(a?.landingPage),
      ts_referrer: meta(referrerHost(a?.referrer) ?? a?.referrer),
      ts_utm: meta([a?.utm_source, a?.utm_medium, a?.utm_campaign].filter(Boolean).join(" / ")),
      ts_device: meta([ctx.deviceType, ctx.os, ctx.browser].join(" · ")),
      ts_location: meta([ctx.city, ctx.region, ctx.country].filter(Boolean).join(", ")),
      ts_country: meta(ctx.country),
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
