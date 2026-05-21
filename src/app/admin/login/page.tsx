"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-lg">
        <h1 className="font-black text-2xl uppercase mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="px-4 py-3 rounded-xl border border-[#EDEBE5] outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          {error && <p className="text-red-500 text-sm">Incorrect password.</p>}
          <button type="submit" className="btn-primary w-full text-center">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
