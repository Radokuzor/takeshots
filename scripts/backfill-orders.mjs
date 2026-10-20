// Copies successful Take V2 payments from Stripe into the Firestore `orders`
// collection (the same shape the Stripe webhook writes). Safe to re-run: an
// order that already exists is skipped.
//
//   node scripts/backfill-orders.mjs [days=90]          dry run
//   node scripts/backfill-orders.mjs [days=90] --write  actually write
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Stripe = require("stripe");
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
  })
);
const write = process.argv.includes("--write");
const days = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 90);

const raw = env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
const key = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
const db = getFirestore(initializeApp({ credential: cert(key), projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }));
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

let found = 0, created = 0, skipped = 0;
for await (const p of stripe.paymentIntents.list({ limit: 100, created: { gte: Math.floor(Date.now() / 1000) - days * 86400 } })) {
  // Only payments from this site's checkout carry order_items metadata.
  if (p.status !== "succeeded" || !p.metadata?.order_items) continue;
  found++;
  const ref = db.collection("orders").doc(p.id);
  if ((await ref.get()).exists) { skipped++; continue; }

  const full = await stripe.paymentIntents.retrieve(p.id, { expand: ["latest_charge"] });
  const charge = full.latest_charge;
  const shipping = full.shipping ?? charge?.shipping ?? null;
  const addr = shipping?.address;
  const order = {
    id: p.id,
    customer_email: full.receipt_email ?? charge?.billing_details?.email ?? "unknown",
    customer_name: shipping?.name ?? null,
    phone: shipping?.phone ?? null,
    shipping: addr
      ? { line1: addr.line1 ?? null, line2: addr.line2 ?? null, city: addr.city ?? null, state: addr.state ?? null, postal_code: addr.postal_code ?? null, country: addr.country ?? null }
      : null,
    stripe_payment_id: p.id,
    items: JSON.parse(p.metadata.order_items),
    total: p.amount / 100,
    status: "pending",
    created_at: new Date(p.created * 1000).toISOString(),
  };
  console.log(`${write ? "WRITE" : "would write"} ${order.created_at.slice(0, 10)} $${order.total} ${order.customer_name ?? "?"} (${addr?.city ?? "no address"})`);
  if (write) { await ref.create(order); created++; }
}
console.log(`\n${found} Take V2 sales in last ${days} days · ${skipped} already in Firestore · ${write ? `${created} written` : "dry run — pass --write to save"}`);
