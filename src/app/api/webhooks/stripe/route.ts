import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { esc, notifyTelegram, siteUrl } from "@/lib/telegram";
import { countryFlag, formatDuration } from "@/lib/analyticsServer";
import type { AnalyticsSession, OrderItem } from "@/lib/types";

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

    const items: OrderItem[] = paymentIntent.metadata?.order_items
      ? JSON.parse(paymentIntent.metadata.order_items)
      : [];

    // Always expand the charge — it carries payment-method, risk and receipt
    // details for the notification. Shipping details are attached to the
    // PaymentIntent by the checkout's Stripe AddressElement (mode: "shipping") at
    // confirm time; fall back to the charge's details if they're somehow missing.
    let shipping = paymentIntent.shipping;
    let email = paymentIntent.receipt_email;
    let charge: Stripe.Charge | null = null;
    try {
      const full = await stripe.paymentIntents.retrieve(paymentIntent.id, {
        expand: ["latest_charge"],
      });
      charge = full.latest_charge as Stripe.Charge | null;
      shipping = shipping ?? full.shipping ?? charge?.shipping ?? null;
      email = email ?? charge?.billing_details?.email ?? null;
    } catch {
      // best-effort — fall through with whatever we have
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

    // 23505 = unique violation on stripe_payment_id — a duplicate webhook
    // delivery we've already saved and announced.
    if (error?.code === "23505") return NextResponse.json({ received: true });

    if (error) {
      console.error("Failed to save order:", error);
      await notifyTelegram(
        `⚠️ <b>Order save FAILED</b> for ${esc(paymentIntent.id)}\n${esc(error.message)}\nCheck Supabase — payment went through but the order row was not written.`
      );
    }

    let message: string;
    try {
      message = await buildOrderMessage({ paymentIntent, charge, items, email, shipping, saveFailed: !!error });
    } catch (err) {
      console.error("Failed to build order notification:", err);
      message = `🎉 <b>New order — $${(paymentIntent.amount / 100).toFixed(2)}</b>\n${esc(email ?? "unknown")}\n${esc(paymentIntent.id)}`;
    }
    await notifyTelegram(message);
  }

  return NextResponse.json({ received: true });
}

const money = (n: number) => `$${n.toFixed(2)}`;

async function buildOrderMessage({
  paymentIntent,
  charge,
  items,
  email,
  shipping,
  saveFailed,
}: {
  paymentIntent: Stripe.PaymentIntent;
  charge: Stripe.Charge | null;
  items: OrderItem[];
  email: string | null;
  shipping: Stripe.PaymentIntent.Shipping | null;
  saveFailed: boolean;
}) {
  const md = paymentIntent.metadata ?? {};
  const total = paymentIntent.amount / 100;
  const units = items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const addr = shipping?.address;

  const lines: string[] = [
    `🎉 <b>New order — ${money(total)}</b>`,
    "",
    "🛍 <b>Items</b>",
    ...items.map((i) => `  • ${i.quantity}× ${esc(i.name)} @ ${money(Number(i.price))}`),
    `  Units: ${units}`,
    "",
    "👤 <b>Customer</b>",
    `  ${esc(shipping?.name ?? charge?.billing_details?.name ?? "Unknown name")}`,
    `  ${esc(email ?? "unknown email")}`,
  ];
  if (shipping?.phone) lines.push(`  📞 ${esc(shipping.phone)}`);
  if (addr) {
    lines.push(
      `  📦 ${esc([addr.line1, addr.line2].filter(Boolean).join(", "))}`,
      `      ${esc([addr.city, addr.state, addr.postal_code].filter(Boolean).join(" "))} ${esc(addr.country ?? "")} ${countryFlag(addr.country)}`
    );
  }

  // Payment details
  const pm = charge?.payment_method_details;
  const card = pm?.card;
  const payLines: string[] = [];
  if (card) {
    const wallet = card.wallet?.type ? ` via ${card.wallet.type.replace(/_/g, " ")}` : "";
    payLines.push(
      `  ${esc(card.brand ?? "card")} •••• ${esc(card.last4 ?? "")}${esc(wallet)} (${esc(card.funding ?? "?")}, issued in ${esc(card.country ?? "?")})`
    );
    if (card.checks) {
      payLines.push(
        `  CVC: ${esc(card.checks.cvc_check ?? "n/a")} · ZIP: ${esc(card.checks.address_postal_code_check ?? "n/a")}`
      );
    }
  } else if (pm?.type) {
    payLines.push(`  ${esc(pm.type.replace(/_/g, " "))}`);
  }
  if (charge?.outcome?.risk_level) {
    const score = charge.outcome.risk_score != null ? ` (${charge.outcome.risk_score})` : "";
    payLines.push(`  Risk: ${esc(charge.outcome.risk_level)}${score}`);
  }
  if (payLines.length) lines.push("", "💳 <b>Payment</b>", ...payLines);

  // Attribution — forwarded from the checkout request via PaymentIntent metadata.
  const attr: string[] = [
    `  Source: ${esc(md.ts_referrer || "Direct")}${md.ts_utm ? ` (utm: ${esc(md.ts_utm)})` : ""}`,
  ];
  if (md.ts_landing_page) attr.push(`  Landing: ${esc(md.ts_landing_page)}`);
  if (md.ts_device) attr.push(`  Device: ${esc(md.ts_device)}`);
  if (md.ts_location) attr.push(`  Location: ${countryFlag(md.ts_country)} ${esc(md.ts_location)}`);
  if (md.ts_visit_number) {
    attr.push(`  ${md.ts_visit_number === "1" ? "First visit" : `Visit #${esc(md.ts_visit_number)}`}`);
  }

  const db = supabaseAdmin();

  // Visitor history from stored analytics (best-effort; the current session is
  // usually only written once the buyer leaves the tab).
  if (md.ts_visitor_id) {
    const { data } = await db
      .from("analytics_sessions")
      .select("started_at, duration_ms, page_count")
      .eq("visitor_id", md.ts_visitor_id)
      .order("started_at", { ascending: true });
    const sessions = (data ?? []) as Pick<AnalyticsSession, "started_at" | "duration_ms" | "page_count">[];
    if (sessions.length > 0) {
      const totalTime = sessions.reduce((n, s) => n + s.duration_ms, 0);
      const totalPages = sessions.reduce((n, s) => n + s.page_count, 0);
      attr.push(
        `  Earlier sessions: ${sessions.length} · ${totalPages} pages · ${formatDuration(totalTime)} on site`,
        `  First visit → purchase: ${formatDuration(Date.now() - Date.parse(sessions[0].started_at))}`
      );
    }
  }
  lines.push("", "📈 <b>Attribution</b>", ...attr);

  // Running totals + repeat-customer check.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const [{ data: all }, { data: prior }] = await Promise.all([
    db.from("orders").select("total, created_at").neq("status", "cancelled"),
    email
      ? db.from("orders").select("id").eq("customer_email", email).neq("stripe_payment_id", paymentIntent.id)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ]);
  const rows = (all ?? []) as { total: number; created_at: string }[];
  if (rows.length > 0) {
    const sum = (rs: typeof rows) => rs.reduce((n, r) => n + Number(r.total), 0);
    const today = rows.filter((r) => Date.parse(r.created_at) >= startOfDay.getTime());
    const priorCount = prior?.length ?? 0;
    lines.push(
      "",
      "📊 <b>Totals</b>",
      `  Today (UTC): ${today.length} orders · ${money(sum(today))}`,
      `  All time: ${rows.length} orders · ${money(sum(rows))} · avg ${money(sum(rows) / rows.length)}`,
      priorCount > 0
        ? `  🔁 Repeat customer (${priorCount} previous order${priorCount > 1 ? "s" : ""})`
        : "  🆕 First-time customer"
    );
  }

  const links = [
    `<a href="https://dashboard.stripe.com/payments/${esc(paymentIntent.id)}">Stripe</a>`,
    charge?.receipt_url ? `<a href="${esc(charge.receipt_url)}">Receipt</a>` : null,
    `<a href="${esc(siteUrl())}/admin">Fulfil</a>`,
    `<a href="${esc(siteUrl())}/admin/analytics">Analytics</a>`,
  ].filter(Boolean);
  lines.push("", links.join(" · "));
  if (saveFailed) lines.push("⚠️ Order row was NOT saved — see the previous alert.");

  return lines.join("\n");
}
