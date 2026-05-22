import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { items }: { items: CartItem[] } = await req.json();

  const line_items = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        images: item.product.photo_url ? [item.product.photo_url] : [],
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop?cancelled=1`,
    allow_promotion_codes: true,
    
    // 👇 ADDED THIS TO FORCE SHIPPING ADDRESS COLLECTION 👇
    shipping_address_collection: {
      allowed_countries: ["US", "CA"], // Add any country codes you want to allow shipping to
    },

    // 👇 OPTIONAL: Forces the billing zip code to match for fraud prevention 👇
    billing_address_collection: "required", 
  });

  return NextResponse.json({ sessionId: session.id });
}