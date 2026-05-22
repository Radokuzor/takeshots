import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface ParsedReview { stars: string; title: string; body: string; }

function extractReviews(html: string): ParsedReview[] {
  const reviews: ParsedReview[] = [];
  const reviewBlocks = html.match(/data-hook="review"[\s\S]*?(?=data-hook="review"|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div id="cm_cr-review_list")/g) ?? [];

  for (const block of reviewBlocks.slice(0, 6)) {
    const starMatch = block.match(/data-hook="review-star-rating"[^>]*>\s*<span[^>]*>([^<]+)</);
    const titleMatch = block.match(/data-hook="review-title"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</);
    const bodyMatch = block.match(/data-hook="review-body"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);

    const stars = starMatch?.[1]?.trim().split(" ")[0] ?? "";
    const title = titleMatch?.[1]?.trim() ?? "";
    const body = bodyMatch?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "";

    if (title || body) reviews.push({ stars, title, body });
  }

  return reviews;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: product } = await supabase
    .from("products")
    .select("id, amazon_asin, reviews")
    .eq("id", id)
    .single();

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Already has reviews — return them, nothing to fetch
  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    return NextResponse.json({ reviews: product.reviews });
  }

  if (!product.amazon_asin) {
    return NextResponse.json({ reviews: [] });
  }

  const key = process.env.SCRAPERAPI_KEY;
  if (!key) return NextResponse.json({ reviews: [] });

  try {
    const reviewsUrl = `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(
      `https://www.amazon.com/product-reviews/${product.amazon_asin}?sortBy=helpful`
    )}`;
    const res = await fetch(reviewsUrl, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return NextResponse.json({ reviews: [] });

    const html = await res.text();
    const reviews = extractReviews(html);

    if (reviews.length > 0) {
      await supabase.from("products").update({ reviews }).eq("id", id);
    }

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}
