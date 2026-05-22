"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Pencil, Sparkles, Link, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, Article, OccasionTag, ArticleCategory, Review } from "@/lib/types";

const OCCASIONS: OccasionTag[] = [
  "bachelorette", "bachelor", "wedding", "birthday", "anniversary", "game_night", "holiday",
];

const OCCASION_LABELS: Record<OccasionTag, string> = {
  bachelorette: "Bachelorette / Hers", bachelor: "Bachelor / His", wedding: "Wedding", birthday: "Birthday",
  anniversary: "Anniversary", game_night: "Game Night", holiday: "Holiday",
};

const BLANK_PRODUCT = {
  name: "", description: "", price: 0,
  occasion_tags: [] as OccasionTag[],
  amazon_asin: "", pros: "", cons: "", key_points: "", featured: false,
  existing_photo_url: "" as string,
  reviews: [] as Review[],
};

const BLANK_ARTICLE_FORM = {
  title: "", slug: "", category: "blog" as ArticleCategory, city: "", author: "TakeShots Team",
  prompt: "", selectedProductIds: [] as string[],
};

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminClient() {
  const [tab, setTab] = useState<"products" | "articles">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  // Product form state
  const [form, setForm] = useState(BLANK_PRODUCT);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Manual photo uploads (multiple)
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Amazon-sourced image URLs
  const [allAmazonImageUrls, setAllAmazonImageUrls] = useState<string[]>([]);

  // Combined preview list (manual files take priority over Amazon)
  const activePreviews = photoPreviews.length ? photoPreviews : allAmazonImageUrls;

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Amazon import state
  const [amazonUrl, setAmazonUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  // Article generator state
  const [articleForm, setArticleForm] = useState(BLANK_ARTICLE_FORM);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [articleMsg, setArticleMsg] = useState("");

  useEffect(() => {
    supabase.from("products").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data as Product[]) ?? []));
    supabase.from("articles").select("*").order("last_updated", { ascending: false })
      .then(({ data }) => setArticles((data as Article[]) ?? []));
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotoFiles(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
    setAllAmazonImageUrls([]);
  }

  function removeManualPhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleOccasion(tag: OccasionTag) {
    setForm((prev) => ({
      ...prev,
      occasion_tags: prev.occasion_tags.includes(tag)
        ? prev.occasion_tags.filter((t) => t !== tag)
        : [...prev.occasion_tags, tag],
    }));
  }

  function startEditing(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      occasion_tags: p.occasion_tags?.length
        ? p.occasion_tags
        : p.occasion_tag
        ? [p.occasion_tag]
        : [],
      amazon_asin: p.amazon_asin ?? "",
      pros: (p.pros ?? []).join(", "),
      cons: (p.cons ?? []).join(", "),
      key_points: (p.key_points ?? []).join(", "),
      featured: p.featured,
      existing_photo_url: p.photo_url ?? "",
      reviews: p.reviews ?? [],
    });
    setPhotoFiles([]);
    setPhotoPreviews(p.photo_urls?.length ? p.photo_urls : p.photo_url ? [p.photo_url] : []);
    setAllAmazonImageUrls([]);
    setMsg("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(BLANK_PRODUCT);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setAllAmazonImageUrls([]);
    setMsg("");
  }

  async function importFromAmazon() {
    if (!amazonUrl.trim()) return;
    setImporting(true);
    setImportMsg("Fetching from Amazon… ~15s");
    try {
      const res = await fetch("/api/admin/amazon-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: amazonUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to import");
      setForm((prev) => ({
        ...prev,
        name: data.name ?? prev.name,
        description: data.description ?? prev.description,
        key_points: Array.isArray(data.key_points) ? data.key_points.join(", ") : (data.key_points ?? prev.key_points),
        pros: Array.isArray(data.pros) ? data.pros.join(", ") : (data.pros ?? prev.pros),
        cons: Array.isArray(data.cons) ? data.cons.join(", ") : (data.cons ?? prev.cons),
        price: data.price ?? prev.price,
        amazon_asin: data.amazon_asin ?? prev.amazon_asin,
        reviews: Array.isArray(data.reviews) ? data.reviews : prev.reviews,
      }));
      const imgUrls: string[] = data.amazon_image_urls ?? (data.amazon_image_url ? [data.amazon_image_url] : []);
      setAllAmazonImageUrls(imgUrls);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setAmazonUrl("");
      setImportMsg(`Filled! Found ${imgUrls.length} image${imgUrls.length !== 1 ? "s" : ""}. Set occasions & save.`);
    } catch (e) {
      setImportMsg((e as Error).message);
    }
    setImporting(false);
    setTimeout(() => setImportMsg(""), 10000);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.occasion_tags.length) {
      setMsg("Pick at least one occasion.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    setSaving(true);

    // --- Determine final photo_url / photo_urls ---
    let photo_url: string | null = form.existing_photo_url || null;
    let photo_urls: string[] | undefined;
    let amazon_image_urls: string[] | undefined;

    if (photoFiles.length > 0) {
      // Upload all manually-selected files
      const results = await Promise.all(
        photoFiles.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
          const json = await res.json();
          return res.ok ? (json.url as string) : null;
        })
      );
      const valid = results.filter(Boolean) as string[];
      if (valid.length) {
        photo_url = valid[0];
        photo_urls = valid;
      } else {
        setMsg("Photo upload failed. Try again.");
        setSaving(false);
        return;
      }
    } else if (allAmazonImageUrls.length) {
      // Let the API handle download + upload of Amazon images
      amazon_image_urls = allAmazonImageUrls;
      photo_url = null;
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      photo_url,
      occasion_tags: form.occasion_tags,
      amazon_asin: form.amazon_asin || null,
      pros: form.pros ? form.pros.split(",").map((s) => s.trim()) : [],
      cons: form.cons ? form.cons.split(",").map((s) => s.trim()) : [],
      key_points: form.key_points ? form.key_points.split(",").map((s) => s.trim()) : [],
      featured: form.featured,
      ...(form.reviews.length ? { reviews: form.reviews } : {}),
    };
    if (photo_urls !== undefined) payload.photo_urls = photo_urls;
    if (amazon_image_urls !== undefined) payload.amazon_image_urls = amazon_image_urls;

    const isEditing = !!editingId;
    const res = await fetch(
      isEditing ? `/api/admin/products?id=${editingId}` : "/api/admin/products",
      { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const data = await res.json();

    if (res.ok) {
      if (isEditing) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? (data as Product) : p)));
        setMsg("Product updated!");
        setEditingId(null);
      } else {
        setProducts((prev) => [data as Product, ...prev]);
        setMsg("Product saved!");
      }
      setForm(BLANK_PRODUCT);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setAllAmazonImageUrls([]);
    } else {
      setMsg(data.error ?? "Error saving product.");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function deleteProduct(id: string) {
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) cancelEditing();
  }

  async function deleteArticle(id: string) {
    await fetch("/api/admin/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "articles", id }),
    });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  function toggleArticleProduct(id: string) {
    setArticleForm((prev) => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(id)
        ? prev.selectedProductIds.filter((x) => x !== id)
        : [...prev.selectedProductIds, id],
    }));
  }

  async function generateArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!articleForm.prompt.trim()) {
      setArticleMsg("Add an article prompt.");
      setTimeout(() => setArticleMsg(""), 3000);
      return;
    }
    setGeneratingArticle(true);
    setArticleMsg("Generating article… ~25s");
    try {
      const res = await fetch("/api/admin/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleForm.title || undefined,
          slug: articleForm.slug || undefined,
          category: articleForm.category,
          city: articleForm.city,
          author: articleForm.author,
          prompt: articleForm.prompt,
          productIds: articleForm.selectedProductIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate article");
      setArticles((prev) => [data as Article, ...prev]);
      setArticleForm(BLANK_ARTICLE_FORM);
      setArticleMsg(`Saved: "${(data as Article).title}"`);
    } catch (e) {
      setArticleMsg((e as Error).message);
    }
    setGeneratingArticle(false);
    setTimeout(() => setArticleMsg(""), 8000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-black text-3xl uppercase mb-8">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        {(["products", "articles"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-pill font-bold text-sm uppercase border-2 transition-all ${
              tab === t ? "bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white border-transparent" : "border-[#EDEBE5] bg-white"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Products tab ────────────────────────────────── */}
      {tab === "products" && (
        <div className="flex flex-col gap-10">

          {/* Amazon import */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDEBE5]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#FF6B35]" />
              <h2 className="font-black text-lg uppercase">Import from Amazon</h2>
            </div>
            <p className="text-sm text-[#1A1A1A]/60 mb-4">
              Paste an Amazon URL — AI fills name, description, key points, pros & cons, and pulls all product images automatically.
            </p>
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[260px] flex items-center gap-2 px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm">
                <Link size={14} className="text-[#1A1A1A]/40 shrink-0" />
                <input
                  type="url"
                  placeholder="https://www.amazon.com/dp/..."
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  className="flex-1 outline-none bg-transparent"
                />
              </div>
              <button onClick={importFromAmazon} disabled={importing || !amazonUrl.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                {importing ? "Fetching…" : "Fill with AI"}
              </button>
            </div>
            {importMsg && (
              <p className={`text-sm mt-3 font-medium ${importMsg.startsWith("Filled") ? "text-green-600" : "text-[#1A1A1A]/60"}`}>
                {importMsg}
              </p>
            )}
          </div>

          {/* Product form */}
          <div ref={formRef} className={`bg-white rounded-2xl p-6 shadow-sm ${editingId ? "ring-2 ring-[#FF6B35]" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg uppercase">{editingId ? "Edit Product" : "Add Product"}</h2>
              {editingId && (
                <button onClick={cancelEditing} className="flex items-center gap-1 text-sm text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
            <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Name / Price / ASIN */}
              {[
                { label: "Name *", key: "name", type: "text", required: true },
                { label: "Price *", key: "price", type: "number", required: true },
                { label: "Amazon ASIN", key: "amazon_asin", type: "text" },
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">{f.label}</label>
                  <input type={f.type} required={f.required}
                    value={(form as unknown as Record<string, string | number | boolean>)[f.key] as string}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              ))}

              {/* Photos */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">
                  Photos
                  {allAmazonImageUrls.length > 0 && <span className="text-[#FF6B35] ml-1">({allAmazonImageUrls.length} from Amazon)</span>}
                  {photoFiles.length > 0 && <span className="text-green-600 ml-1">({photoFiles.length} selected)</span>}
                </label>
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange}
                  className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EDEBE5] file:px-3 file:py-1 file:text-xs file:font-bold file:uppercase file:cursor-pointer"
                />
                {/* Thumbnail strip */}
                {activePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-1">
                    {activePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <Image src={src} alt={`photo ${i + 1}`} width={64} height={64}
                          className="rounded-xl object-cover w-16 h-16 border-2 border-[#EDEBE5]"
                        />
                        {photoFiles.length > 0 && (
                          <button type="button" onClick={() => removeManualPhoto(i)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Occasions — multi-select checkboxes */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">
                  Occasions * <span className="text-[#1A1A1A]/40 normal-case font-normal">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => {
                    const selected = form.occasion_tags.includes(o);
                    return (
                      <button key={o} type="button" onClick={() => toggleOccasion(o)}
                        className={`px-4 py-1.5 rounded-pill text-sm font-bold border-2 transition-all ${
                          selected
                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FF4500] text-white border-transparent"
                            : "border-[#EDEBE5] bg-white text-[#1A1A1A]/70 hover:border-[#FF6B35]"
                        }`}>
                        {OCCASION_LABELS[o]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                <label htmlFor="featured" className="text-sm font-semibold">Featured on homepage</label>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">Description</label>
                <textarea rows={3} value={form.description}
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
                  <input type="text" value={(form as unknown as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              ))}

              <div className="sm:col-span-2 flex items-center gap-4">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? (editingId ? "Updating…" : "Saving…") : (editingId ? "Update Product" : "Save Product")}
                </button>
                {editingId && <button type="button" onClick={cancelEditing} className="btn-ghost">Cancel</button>}
                {msg && (
                  <span className={`text-sm font-semibold ${msg.includes("Error") || msg.includes("failed") || msg.includes("Pick") ? "text-red-500" : "text-green-600"}`}>
                    {msg}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Product table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EDEBE5]">
                <tr>
                  {["Photo", "Name", "Occasions", "Price", "★", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wide text-[#1A1A1A]/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const tags = p.occasion_tags?.length ? p.occasion_tags : p.occasion_tag ? [p.occasion_tag] : [];
                  return (
                    <tr key={p.id} className={`border-t border-[#EDEBE5] hover:bg-[#F5F4F0]/50 ${editingId === p.id ? "bg-orange-50" : ""}`}>
                      <td className="px-4 py-3">
                        {p.photo_url
                          ? <Image src={p.photo_url} alt={p.name} width={40} height={40} className="rounded-lg object-cover w-10 h-10" />
                          : <div className="w-10 h-10 rounded-lg bg-[#EDEBE5]" />}
                      </td>
                      <td className="px-4 py-3 font-semibold max-w-[160px] truncate">{p.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded-full bg-[#EDEBE5] text-[10px] font-bold capitalize">
                              {t.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{p.featured ? "✓" : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEditing(p)} className="text-[#FF6B35] hover:opacity-70 transition-opacity" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#1A1A1A]/40">No products yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Articles tab ────────────────────────────────── */}
      {tab === "articles" && (
        <div className="flex flex-col gap-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDEBE5]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#FF6B35]" />
              <h2 className="font-black text-lg uppercase">Generate Article with AI</h2>
            </div>
            <p className="text-sm text-[#1A1A1A]/60 mb-4">
              Select products to feature, write a prompt, and AI writes the full article with clickable product cards embedded automatically.
            </p>
            <form onSubmit={generateArticle} className="flex flex-col gap-5">

              {/* Prompt */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">
                  Article Prompt *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. A fun bachelorette gift guide focusing on drinking games and personalized gifts. Upbeat, slightly cheeky tone."
                  value={articleForm.prompt}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, prompt: e.target.value }))}
                  className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                />
              </div>

              {/* Product picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">
                  Products to Feature
                  {articleForm.selectedProductIds.length > 0 && (
                    <span className="text-[#FF6B35] ml-1 normal-case font-normal">
                      ({articleForm.selectedProductIds.length} selected)
                    </span>
                  )}
                </label>
                {products.length === 0 ? (
                  <p className="text-sm text-[#1A1A1A]/40">No products yet — add some in the Products tab first.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-[#EDEBE5] rounded-xl divide-y divide-[#EDEBE5]">
                    {products.map((p) => {
                      const selected = articleForm.selectedProductIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleArticleProduct(p.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            selected ? "bg-orange-50" : "hover:bg-[#F5F4F0]"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            selected ? "bg-[#FF6B35] border-[#FF6B35]" : "border-[#EDEBE5]"
                          }`}>
                            {selected && <span className="text-white text-[10px] font-black">✓</span>}
                          </span>
                          {(p.photo_urls?.[0] ?? p.photo_url) && (
                            // eslint-disable-next-line @next/next-eslint/no-img-element
                            <img
                              src={p.photo_urls?.[0] ?? p.photo_url ?? ""}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <span className="flex-1 min-w-0">
                            <span className="text-sm font-semibold truncate block">{p.name}</span>
                            <span className="text-xs text-[#1A1A1A]/50">${p.price.toFixed(2)}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Title / Slug / Category row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">
                    Article Title
                    <span className="text-[#1A1A1A]/40 normal-case font-normal ml-1">(leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated from prompt"
                    value={articleForm.title}
                    onChange={(e) =>
                      setArticleForm((prev) => ({ ...prev, title: e.target.value, slug: prev.slug || toSlug(e.target.value) }))
                    }
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">
                    Slug
                    <span className="text-[#1A1A1A]/40 normal-case font-normal ml-1">(auto-generated if blank)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated-slug"
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">Category *</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, category: e.target.value as ArticleCategory }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  >
                    <option value="blog">Blog</option>
                    <option value="near_me">Near Me</option>
                  </select>
                </div>
                {articleForm.category === "near_me" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">City</label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={articleForm.city}
                      onChange={(e) => setArticleForm((prev) => ({ ...prev, city: e.target.value }))}
                      className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#1A1A1A]/60">Author</label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, author: e.target.value }))}
                    className="px-3 py-2 border border-[#EDEBE5] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button type="submit" disabled={generatingArticle} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {generatingArticle ? "Generating…" : "Generate & Save"}
                </button>
                {articleMsg && (
                  <span className={`text-sm font-medium ${articleMsg.startsWith("Article generated") ? "text-green-600" : "text-red-500"}`}>
                    {articleMsg}
                  </span>
                )}
              </div>
            </form>
          </div>

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
                      <a href={`/${a.category === "near_me" ? "near-me" : "blog"}/${a.city ?? a.slug}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#FF6B35] hover:opacity-70 transition-opacity">
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
        </div>
      )}
    </div>
  );
}
