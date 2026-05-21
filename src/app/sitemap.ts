import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://takeshots.com";

const STATIC_ROUTES = [
  "/",
  "/shop",
  "/play",
  "/about",
  "/near-me",
  "/near-me/austin",
  "/near-me/houston",
  "/near-me/dallas",
  "/blog",
  "/gifts/bachelorette",
  "/gifts/wedding",
  "/gifts/birthday",
  "/gifts/anniversary",
  "/gifts/game_night",
  "/gifts/holiday",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articlesRaw } = await supabase
    .from("articles")
    .select("slug, category, city, last_updated");

  const articles = (articlesRaw ?? []) as Array<{
    slug: string;
    category: string;
    city: string | null;
    last_updated: string;
  }>;

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/${a.category === "near_me" ? `near-me/${a.city}` : `blog/${a.slug}`}`,
    lastModified: new Date(a.last_updated),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8,
    })),
    ...articleRoutes,
  ];
}
