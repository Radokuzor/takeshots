import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Article, Product } from "@/lib/types";
import ArticlePage from "@/components/ArticlePage";

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("category", "blog")
    .single();
  return data as Article | null;
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
  if (!article) return {};
  return {
    title: article.title,
    description: article.tags?.[0] ?? undefined,
    openGraph: { title: `${article.title} | TakeShots` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const [related, embeddedProducts] = await Promise.all([
    getRelated(article.related_slugs ?? []),
    getEmbeddedProducts(article.body ?? ""),
  ]);
  return <ArticlePage article={article} relatedArticles={related} embeddedProducts={embeddedProducts} />;
}
