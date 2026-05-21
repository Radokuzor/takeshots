"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, Article, OccasionTag } from "@/lib/types";

const OCCASIONS: OccasionTag[] = [
  "bachelorette", "wedding", "birthday", "anniversary", "game_night", "holiday",
];

const BLANK_PRODUCT = {
  name: "", description: "", price: 0, photo_url: "", occasion_tag: "bachelorette" as OccasionTag,
  amazon_asin: "", pros: "", cons: "", key_points: "", featured: false,
};

export default function AdminClient() {
  const [tab, setTab] = useState<"products" | "articles">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState(BLANK_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => setProducts((data as Product[]) ?? []));
    supabase.from("articles").select("*").order("last_updated", { ascending: false }).then(({ data }) => setArticles((data as Article[]) ?? []));
  }, []);

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      photo_url: form.photo_url || null,
      occasion_tag: form.occasion_tag,
      amazon_asin: form.amazon_asin || null,
      pros: form.pros ? form.pros.split(",").map((s) => s.trim()) : [],
      cons: form.cons ? form.cons.split(",").map((s) => s.trim()) : [],
      key_points: form.key_points ? form.key_points.split(",").map((s) => s.trim()) : [],
      featured: form.featured,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from("products").insert(payload).select().single();
    if (!error && data) {
      setProducts((prev) => [data as Product, ...prev]);
      setForm(BLANK_PRODUCT);
      setMsg("Product saved!");
    } else {
      setMsg(error?.message ?? "Error saving product.");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteProduct(id: string) {
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function deleteArticle(id: string) {
    await supabase.from("articles").delete().eq("id", id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-black text-3xl uppercase mb-8">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        {(["products", "articles"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-pill font-bold text-sm uppercase border-2 transition-all ${
              tab === t
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white border-transparent"
                : "border-[#EDEBE5] bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === "products" && (
        <div className="flex flex-col gap-10">
          {/* Upload form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-black text-lg uppercase mb-4">Add Product</h2>
            <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Name *", key: "name", type: "text", required: true },
                { label: "Price *", key: "price", type: "number", required: true },
                { label: "Photo URL", key: "photo_url", type: "url" },
                { label: "Amazon ASIN", key: "amazon_asin", type: "text" },
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={(form as unknown as Record<string, string | number | boolean>)[f.key] as string}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              ))}

              {/* Occasion */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">Occasion *</label>
                <select
                  value={form.occasion_tag}
                  onChange={(e) => setForm((prev) => ({ ...prev, occasion_tag: e.target.value as OccasionTag }))}
                  className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                <label htmlFor="featured" className="text-sm font-semibold">Featured on homepage</label>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                />
              </div>

              {[
                { label: "Key Points (comma-separated)", key: "key_points" },
                { label: "Pros (comma-separated)", key: "pros" },
                { label: "Cons (comma-separated)", key: "cons" },
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">{f.label}</label>
                  <input
                    type="text"
                    value={(form as unknown as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              ))}

              <div className="sm:col-span-2 flex items-center gap-4">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save Product"}
                </button>
                {msg && <span className="text-sm text-green-600 font-semibold">{msg}</span>}
              </div>
            </form>
          </div>

          {/* Product table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EDEBE5]">
                <tr>
                  {["Photo", "Name", "Occasion", "Price", "Featured", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wide text-[#1A1A1A]/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-[#EDEBE5] hover:bg-[#F5F4F0]/50">
                    <td className="px-4 py-3">
                      {p.photo_url ? (
                        <Image src={p.photo_url} alt={p.name} width={40} height={40} className="rounded-lg object-cover w-10 h-10" />
                      ) : <div className="w-10 h-10 rounded-lg bg-[#EDEBE5]" />}
                    </td>
                    <td className="px-4 py-3 font-semibold max-w-[180px] truncate">{p.name}</td>
                    <td className="px-4 py-3 capitalize">{p.occasion_tag?.replace("_", " ")}</td>
                    <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">{p.featured ? "✓" : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#1A1A1A]/40">No products yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Articles tab */}
      {tab === "articles" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EDEBE5]">
              <tr>
                {["Title", "Category", "City/Slug", "Updated", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wide text-[#1A1A1A]/60">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-t border-[#EDEBE5] hover:bg-[#F5F4F0]/50">
                  <td className="px-4 py-3 font-semibold max-w-[200px] truncate">{a.title}</td>
                  <td className="px-4 py-3 capitalize">{a.category}</td>
                  <td className="px-4 py-3 text-[#1A1A1A]/60">{a.city ?? a.slug}</td>
                  <td className="px-4 py-3 text-[#1A1A1A]/60">
                    {new Date(a.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <a
                      href={`/${a.category === "near_me" ? "near-me" : "blog"}/${a.city ?? a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:opacity-70 transition-opacity"
                    >
                      <Pencil size={15} />
                    </a>
                    <button onClick={() => deleteArticle(a.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#1A1A1A]/40">No articles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
