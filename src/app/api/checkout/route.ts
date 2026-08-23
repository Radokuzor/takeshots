import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { items }: { items: CartItem[] } = await req.json();

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

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      order_items: JSON.stringify(order_items),
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
