import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_auth")?.value === "1";
  if (!authed) redirect("/admin/login");
  return <AdminClient />;
}
