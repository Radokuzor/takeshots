import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog — Gift Ideas & Party Tips",
  description: "Gift guides, party planning tips, and everything in between.",
};

async function getArticles(): Promise<Article[]> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("category", "blog")
    .order("last_updated", { ascending: false });
  return (data as Article[]) ?? [];
}

export default async function BlogIndexPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="headline mb-10">Blog</h1>
      {articles.length === 0 ? (
        <p className="text-[#1A1A1A]/50">Posts coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="card p-6 group flex flex-col gap-2">
              {a.tags?.[0] && <span className="tag text-[10px] w-fit">{a.tags[0]}</span>}
              <h2 className="font-black text-lg leading-snug group-hover:text-[#FF6B35] transition-colors">
                {a.title}
              </h2>
              <p className="text-[#1A1A1A]/50 text-xs mt-auto pt-2">
                {new Date(a.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
