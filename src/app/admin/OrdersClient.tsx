"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Check, X, ExternalLink, Copy } from "lucide-react";
import type { Order } from "@/lib/types";

type Filter = "pending" | "fulfilled" | "cancelled" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "To fulfil" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

const statusStyles: Record<Order["status"], string> = {
  pending: "bg-[#FFF0E8] text-[#FF4500]",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function addressLines(o: Order): string[] {
  const s = o.shipping;
  if (!s) return [];
  return [
    o.customer_name ?? "",
    s.line1 ?? "",
    s.line2 ?? "",
    [s.city, s.state, s.postal_code].filter(Boolean).join(" "),
    s.country ?? "",
  ].filter((l) => l.trim().length > 0);
}

function OrderCard({
  order,
  onSetStatus,
  busy,
}: {
  order: Order;
  onSetStatus: (id: string, status: Order["status"]) => void;
  busy: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const lines = addressLines(order);

  function copyAddress() {
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{order.customer_name ?? order.customer_email}</p>
          <p className="text-xs text-[#1A1A1A]/45">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[order.status]}`}
          >
            {order.status}
          </span>
          <span className="font-black">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* ship to */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-wide font-bold text-[#1A1A1A]/40">
              Ship to
            </p>
            {lines.length > 0 && (
              <button
                onClick={copyAddress}
                className="text-[11px] font-semibold text-[#FF6B35] inline-flex items-center gap-1 hover:underline"
              >
                <Copy size={11} /> {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          {lines.length > 0 ? (
            <address className="not-italic text-sm leading-relaxed text-[#1A1A1A]/80">
              {lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </address>
          ) : (
            <p className="text-sm text-red-500">No shipping address on this order.</p>
          )}
          <p className="text-xs text-[#1A1A1A]/50 mt-2 break-all">{order.customer_email}</p>
          {order.phone && <p className="text-xs text-[#1A1A1A]/50">{order.phone}</p>}
        </div>

        {/* items */}
        <div>
          <p className="text-[10px] uppercase tracking-wide font-bold text-[#1A1A1A]/40 mb-1.5">
            Pack
          </p>
          <ul className="flex flex-col gap-1 text-sm text-[#1A1A1A]/80">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-2">
                <Package size={13} className="text-[#1A1A1A]/30 shrink-0" />
                <span className="font-semibold">{it.quantity}×</span> {it.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[#EDEBE5] -mx-5 px-5 pt-3">
        {order.status !== "fulfilled" && (
          <button
            onClick={() => onSetStatus(order.id, "fulfilled")}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-green-600 text-white disabled:opacity-50"
          >
            <Check size={13} /> Mark fulfilled
          </button>
        )}
        {order.status === "fulfilled" && (
          <button
            onClick={() => onSetStatus(order.id, "pending")}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full border-2 border-[#EDEBE5] disabled:opacity-50"
          >
            Reopen
          </button>
        )}
        {order.status !== "cancelled" && (
          <button
            onClick={() => onSetStatus(order.id, "cancelled")}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full border-2 border-[#EDEBE5] text-red-600 disabled:opacity-50"
          >
            <X size={13} /> Cancel
          </button>
        )}
        {order.stripe_payment_id && (
          <a
            href={`https://dashboard.stripe.com/payments/${order.stripe_payment_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A1A]/50 hover:text-[#FF6B35]"
          >
            Stripe <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending").length,
      fulfilled: orders.filter((o) => o.status === "fulfilled").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      all: orders.length,
    }),
    [orders]
  );

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0),
    [orders]
  );

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function setStatus(id: string, status: Order["status"]) {
    setBusyId(id);
    setErr(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Update failed");
      }
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-black text-3xl uppercase">Fulfilment</h1>
        <p className="text-sm text-[#1A1A1A]/50">
          {counts.all} orders · ${revenue.toFixed(2)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border-2 transition-colors ${
              filter === f.key
                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                : "border-[#EDEBE5] bg-white hover:border-[#FF6B35]"
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {err && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-4">{err}</p>
      )}

      {visible.length === 0 ? (
        <p className="text-[#1A1A1A]/50 text-sm">
          {filter === "pending"
            ? "Nothing to fulfil right now."
            : "No orders here."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onSetStatus={setStatus}
              busy={busyId === o.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
