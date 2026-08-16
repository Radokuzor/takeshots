"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Sparkles, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import type { ShotContent, ShotContentType } from "@/lib/shotContent";

const BLANK_FORM = {
  type: "guide" as ShotContentType,
  topic: "",
  prompt: "",
  title: "",
  slug: "",
};

export default function ShotContentAdmin() {
  const [items, setItems] = useState<ShotContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK_FORM);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadItems() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "shot_content"), orderBy("createdAt", "desc")));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ShotContent));
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim() || !form.prompt.trim()) {
      setMsg("Add a topic and a direction/prompt.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    setGenerating(true);
    setMsg("Generating… ~20s");
    try {
      const res = await fetch("/api/admin/shot-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          topic: form.topic,
          prompt: form.prompt,
          title: form.title || undefined,
          slug: form.slug || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate content");
      setItems((prev) => [data as ShotContent, ...prev]);
      setForm(BLANK_FORM);
      setMsg(`Saved: "${(data as ShotContent).title}"`);
    } catch (err) {
      setMsg((err as Error).message);
    }
    setGenerating(false);
    setTimeout(() => setMsg(""), 8000);
  }

  async function remove(id: string) {
    await fetch("/api/admin/shot-content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDEBE5]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[#FF6B35]" />
          <h2 className="font-black text-lg uppercase">Generate Shots Content</h2>
        </div>
        <p className="text-sm text-[#1A1A1A]/60 mb-4">
          Guides are long-form SEO articles (e.g. &quot;how many shots get you drunk&quot;). Recipes
          are structured shot recipes with ingredients &amp; steps (e.g. &quot;Kamikaze&quot;). Stored in
          Firestore, published instantly to the Blog.
        </p>
        <form onSubmit={generate} className="flex flex-col gap-4">
          <div className="flex gap-3">
            {(["guide", "recipe"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`px-5 py-2 rounded-pill font-bold text-xs uppercase border-2 transition-all ${
                  form.type === t
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white border-transparent"
                    : "border-[#EDEBE5] bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={form.type === "recipe" ? "Spirit / drink name, e.g. Tequila" : "Topic, e.g. How many shots to get drunk"}
            value={form.topic}
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            className="px-4 py-3 rounded-xl border border-[#EDEBE5] outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
          />
          <textarea
            placeholder="Direction for the AI — angle, audience, key points to hit..."
            value={form.prompt}
            onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
            rows={3}
            className="px-4 py-3 rounded-xl border border-[#EDEBE5] outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm resize-none"
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Title override (optional)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-[#EDEBE5] outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Slug override (optional)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-[#EDEBE5] outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={generating} className="btn-primary">
              {generating ? "Generating..." : "Generate & Publish"}
            </button>
            {msg && <span className="text-sm text-[#1A1A1A]/60">{msg}</span>}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-black text-lg uppercase mb-4">
          Published ({loading ? "…" : items.length})
        </h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#EDEBE5] flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="tag text-[10px]">{item.type}</span>
                  <span className="font-bold text-sm truncate">{item.title}</span>
                </div>
                <p className="text-xs text-[#1A1A1A]/50">/blog/{item.slug}</p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="p-2 text-[#1A1A1A]/40 hover:text-red-500 transition-colors shrink-0"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-sm text-[#1A1A1A]/50">Nothing published yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
