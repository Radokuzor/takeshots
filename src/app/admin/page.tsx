import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") redirect("/admin/login");

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-black text-3xl uppercase mb-6">Fulfilment</h1>
        <div className="card p-6 text-sm">
          <p className="font-bold text-red-600 mb-1">Couldn&apos;t load orders.</p>
          <p className="text-[#1A1A1A]/60">{error.message}</p>
          <p className="text-[#1A1A1A]/60 mt-2">
            Make sure the <code>orders</code> table exists in this Supabase project (with the{" "}
            <code>customer_name</code>, <code>phone</code>, and <code>shipping</code> columns) and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> is set.
          </p>
        </div>
      </div>
    );
  }

  return <OrdersClient orders={(data as Order[]) ?? []} />;
}
