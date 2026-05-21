import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
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
  const related = await getRelated(article.related_slugs ?? []);
  return <ArticlePage article={article} relatedArticles={related} />;
}
