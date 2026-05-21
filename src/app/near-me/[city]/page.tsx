import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import ArticlePage from "@/components/ArticlePage";

async function getArticle(city: string): Promise<Article | null> {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("category", "near_me")
    .eq("city", city)
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
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const article = await getArticle(city);
  if (!article) return {};
  return {
    title: article.title,
    description: `The best bars and venues for bachelorette parties, birthdays, and big nights out in ${article.city}.`,
    openGraph: { title: `${article.title} | TakeShots` },
  };
}

export default async function NearMeCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const article = await getArticle(city);
  if (!article) notFound();
  const related = await getRelated(article.related_slugs ?? []);
  return <ArticlePage article={article} relatedArticles={related} />;
}
