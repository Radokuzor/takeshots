import type { Metadata } from "next";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import type { Article } from "@/lib/types";
import type { ShotContent } from "@/lib/shotContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Gift Ideas, Party Tips & Shot Guides",
  description: "Gift guides, party planning tips, shot recipes, and everything in between.",
};

interface BlogCard {
  key: string;
  href: string;
  title: string;
  tag: string;
  date: string;
}

async function getArticles(): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("category", "blog")
    .order("last_updated", { ascending: false });
  return (data as Article[]) ?? [];
}

async function getShotContent(): Promise<ShotContent[]> {
  const snap = await getDocs(query(collection(db, "shot_content"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ShotContent);
}

export default async function BlogIndexPage() {
  const [articles, shotContent] = await Promise.all([getArticles(), getShotContent()]);

  const cards: BlogCard[] = [
    ...articles.map((a) => ({
      key: a.id,
      href: `/blog/${a.slug}`,
      title: a.title,
      tag: a.tags?.[0] ?? "Blog",
      date: a.last_updated,
    })),
    ...shotContent.map((s) => ({
      key: s.id,
      href: `/blog/${s.slug}`,
      title: s.title,
      tag: s.type === "recipe" ? s.spirit ?? "Recipe" : "Guide",
      date: s.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="headline mb-10">Blog</h1>
      {cards.length === 0 ? (
        <p className="text-[#1A1A1A]/50">Posts coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <Link key={c.key} href={c.href} className="card p-6 group flex flex-col gap-2">
              <span className="tag text-[10px] w-fit">{c.tag}</span>
              <h2 className="font-black text-lg leading-snug group-hover:text-[#FF6B35] transition-colors">
                {c.title}
              </h2>
              <p className="text-[#1A1A1A]/50 text-xs mt-auto pt-2">
                {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
