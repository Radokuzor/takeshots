import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import type { Article, Product } from "@/lib/types";
import type { ShotContent } from "@/lib/shotContent";
import ArticlePage from "@/components/ArticlePage";

export const dynamic = "force-dynamic";

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("category", "blog")
    .single();
  return data as Article | null;
}

async function getShotContent(slug: string): Promise<ShotContent | null> {
  const snap = await getDocs(query(collection(db, "shot_content"), where("slug", "==", slug), limit(1)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as ShotContent;
}

async function getRelated(slugs: string[]): Promise<Article[]> {
  if (!slugs?.length) return [];
  const { data } = await supabase.from("articles").select("*").in("slug", slugs).limit(3);
  return (data as Article[]) ?? [];
}

function extractProductIds(body: string): string[] {
  return [...body.matchAll(/\{\{product:([a-f0-9-]+)\}\}/g)].map((m) => m[1]);
}

async function getEmbeddedProducts(body: string): Promise<Product[]> {
  const ids = extractProductIds(body);
  if (!ids.length) return [];
  const { data } = await supabase.from("products").select("*").in("id", ids);
  return (data as Product[]) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (article) {
    return {
      title: article.title,
      description: article.tags?.[0] ?? undefined,
      openGraph: { title: `${article.title} | TakeShots` },
    };
  }
  const shot = await getShotContent(slug);
  if (shot) {
    return {
      title: shot.title,
      description: shot.metaDescription,
      openGraph: { title: `${shot.title} | TakeShots` },
    };
  }
  return {};
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h2: ({ children }) => <h2 className="font-black text-2xl uppercase mt-10 mb-4">{children}</h2>,
  h3: ({ children }) => <h3 className="font-bold text-xl mt-6 mb-3">{children}</h3>,
  p: ({ children }) => <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 flex flex-col gap-1.5">{children}</ul>,
};

function ShotContentDetail({ item }: { item: ShotContent }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/blog" className="text-sm font-semibold text-[#FF6B35] hover:underline">
        ← Back to Blog
      </Link>

      <div className="mt-4 mb-8">
        <span className="tag mb-3 inline-block">
          {item.type === "recipe" ? item.spirit ?? "Recipe" : "Guide"}
        </span>
        <h1 className="headline text-3xl md:text-5xl mb-3">{item.title}</h1>
      </div>

      {item.type === "recipe" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h2 className="font-black text-lg uppercase mb-3">Ingredients</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[#1A1A1A]/80">
              {item.ingredients?.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-black text-lg uppercase mb-3">Instructions</h2>
            <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-[#1A1A1A]/80">
              {item.instructions?.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <article className="prose prose-neutral max-w-none">
          <ReactMarkdown components={mdComponents}>{item.body ?? ""}</ReactMarkdown>
        </article>
      )}

      {item.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[#EDEBE5] flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="tag text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (article) {
    const [related, embeddedProducts] = await Promise.all([
      getRelated(article.related_slugs ?? []),
      getEmbeddedProducts(article.body ?? ""),
    ]);
    return <ArticlePage article={article} relatedArticles={related} embeddedProducts={embeddedProducts} />;
  }

  const shot = await getShotContent(slug);
  if (shot) return <ShotContentDetail item={shot} />;

  notFound();
}
