"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";

export default function AnalyticsLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/analytics-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/analytics");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-lg">
        <BarChart3 className="text-[#FF4500] mb-3" size={28} />
        <h1 className="font-black text-2xl uppercase mb-1">Analytics</h1>
        <p className="text-sm text-[#1A1A1A]/50 mb-6">Enter the analytics password.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            className="px-4 py-3 rounded-xl border border-[#EDEBE5] outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          {error && <p className="text-red-500 text-sm">Incorrect password.</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full text-center disabled:opacity-60">
            {busy ? "Checking…" : "View analytics"}
          </button>
        </form>
      </div>
    </div>
  );
}
