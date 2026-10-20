import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ORDERS_COLLECTION, adminDb } from "@/lib/firebaseAdmin";
import type { Order } from "@/lib/types";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") redirect("/admin/login");

  let orders: Order[] = [];
  let error: Error | null = null;
  try {
    const snap = await adminDb().collection(ORDERS_COLLECTION).orderBy("created_at", "desc").get();
    orders = snap.docs.map((d) => d.data() as Order);
  } catch (err) {
    error = err as Error;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-black text-3xl uppercase mb-6">Fulfilment</h1>
        <div className="card p-6 text-sm">
          <p className="font-bold text-red-600 mb-1">Couldn&apos;t load orders.</p>
          <p className="text-[#1A1A1A]/60">{error.message}</p>
          <p className="text-[#1A1A1A]/60 mt-2">
            Orders are stored in the Firestore <code>orders</code> collection — make sure{" "}
            <code>FIREBASE_SERVICE_ACCOUNT_KEY</code> is set.
          </p>
        </div>
      </div>
    );
  }

  return <OrdersClient orders={orders} />;
}
