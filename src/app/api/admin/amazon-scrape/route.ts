import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

function extractAmazonContent(html: string): string {
  const sections: string[] = [];

  const titleMatch = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/);
  if (titleMatch) {
    sections.push("TITLE: " + titleMatch[1].replace(/<[^>]+>/g, "").trim());
  }

  const pricePatterns = [
    /id="priceblock_ourprice"[^>]*>([\s\S]*?)<\/span>/,
    /id="priceblock_dealprice"[^>]*>([\s\S]*?)<\/span>/,
    /class="a-price-whole"[^>]*>([\s\S]*?)<\/span>/,
    /"price":\s*"([^"]+)"/,
  ];
  for (const pattern of pricePatterns) {
    const m = html.match(pattern);
    if (m) {
      sections.push("PRICE: " + m[1].replace(/<[^>]+>/g, "").trim());
      break;
    }
  }

  const bulletsMatch = html.match(/id="feature-bullets"([\s\S]*?)<\/ul>/);
  if (bulletsMatch) {
    const liTags = bulletsMatch[1].match(/<li[\s\S]*?<\/li>/g) ?? [];
    const bullets = liTags
      .map((li) => li.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 0)
      .slice(0, 8);
    if (bullets.length) sections.push("FEATURES:\n- " + bullets.join("\n- "));
  }

  const descMatch = html.match(/id="productDescription"([\s\S]*?)<\/div>/);
  if (descMatch) {
    const desc = descMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 1000);
    if (desc) sections.push("DESCRIPTION: " + desc);
  }

  return sections.join("\n\n") || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 3000);
}

function extractReviews(html: string): string {
  const reviews: string[] = [];

  const reviewBlocks = html.match(/data-hook="review"[\s\S]*?(?=data-hook="review"|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div id="cm_cr-review_list")/g) ?? [];

  for (const block of reviewBlocks.slice(0, 6)) {
    const starMatch = block.match(/data-hook="review-star-rating"[^>]*>\s*<span[^>]*>([^<]+)</);
    const titleMatch = block.match(/data-hook="review-title"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</);
    const bodyMatch = block.match(/data-hook="review-body"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);

    const stars = starMatch?.[1]?.trim().split(" ")[0] ?? "";
    const title = titleMatch?.[1]?.trim() ?? "";
    const body = bodyMatch?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 300) ?? "";

    if (title || body) {
      reviews.push(`[${stars}★] ${title}${body ? ": " + body : ""}`);
    }
  }

  return reviews.join("\n\n").slice(0, 2000);
}

function extractAllImageUrls(html: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  function add(url: string) {
    if (url && url.startsWith("https://m.media-amazon.com") && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  // Best source: colorImages JSON embedded in the page script
  const colorMatch = html.match(/'colorImages'\s*:\s*\{\s*'initial'\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
  if (colorMatch) {
    try {
      // Replace single-quoted JS object to valid JSON
      const jsonStr = colorMatch[1].replace(/'([^']+)'\s*:/g, '"$1":').replace(/:\s*'([^']*)'/g, ': "$1"');
      const items: { hiRes?: string; large?: string }[] = JSON.parse(jsonStr);
      for (const item of items) add(item.hiRes ?? item.large ?? "");
    } catch { /* ignore parse errors */ }
  }

  // Fallback: all hiRes values in page JSON
  if (urls.length === 0) {
    for (const m of html.matchAll(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/g)) add(m[1]);
  }

  // Fallback: data-old-hires attribute (single main image)
  if (urls.length === 0) {
    const m = html.match(/data-old-hires="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/);
    if (m) add(m[1]);
  }

  // Fallback: landing image src
  if (urls.length === 0) {
    const m = html.match(/id="landingImage"[^>]*src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/);
    if (m) add(m[1]);
  }

  return urls.slice(0, 6);
}


export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  const asin = asinMatch?.[1] ?? null;

  const key = process.env.SCRAPERAPI_KEY;
  const reviewsUrl = asin
    ? `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(`https://www.amazon.com/product-reviews/${asin}?sortBy=helpful`)}`
    : null;

  if (!key) {
    return NextResponse.json({ error: "SCRAPERAPI_KEY is not set in environment variables." }, { status: 500 });
  }

  // Fetch product page and reviews page in parallel
  let html = "";
  let reviewsHtml = "";
  try {
    const [productRes, reviewsRes] = await Promise.all([
      fetch(`http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(30000) }),
      reviewsUrl ? fetch(reviewsUrl, { signal: AbortSignal.timeout(30000) }) : Promise.resolve(null),
    ]);

    if (!productRes.ok) {
      const errBody = await productRes.text().catch(() => "");
      const isAuth = productRes.status === 401 || productRes.status === 403 || errBody.toLowerCase().includes("invalid api key");
      return NextResponse.json({
        error: isAuth
          ? "ScraperAPI rejected the request — check that your SCRAPERAPI_KEY is valid and has remaining credits."
          : `ScraperAPI returned HTTP ${productRes.status}. The URL may be blocked or your plan limit may be reached.`,
      }, { status: 502 });
    }

    html = await productRes.text();
    reviewsHtml = reviewsRes && reviewsRes.ok ? await reviewsRes.text() : "";
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json({
      error: isTimeout
        ? "ScraperAPI request timed out after 30s. Try again or check your ScraperAPI dashboard."
        : "Failed to reach ScraperAPI. Check your network and SCRAPERAPI_KEY.",
    }, { status: 502 });
  }

  const content = extractAmazonContent(html);
  if (!content.trim()) {
    return NextResponse.json({ error: "Could not extract product info from that URL." }, { status: 422 });
  }

  const reviews = extractReviews(reviewsHtml);

  // Extract all image URLs and run Claude in parallel
  const amazon_image_urls = extractAllImageUrls(html);
  const [message] = await Promise.all([
    new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are writing product content for TakeShots.com, a gifts & party website. Based on the Amazon product data below, generate structured product content. Return ONLY valid JSON with no markdown fences.

Fields:
- name: string (clean product name, max 80 chars, no brand jargon)
- description: string (2-3 sentences, gift-focused and enthusiastic)
- key_points: string[] (3-5 short bullet points about standout features)
- pros: string[] (3 concise pros — draw from real customer reviews if available, use their language)
- cons: string[] (2 honest cons — draw from real customer reviews if available)
- price: number | null (numeric price extracted from data, no $ sign)

Product data:
${content}${reviews ? `\n\nCustomer reviews (real buyer feedback — use these to write authentic pros/cons):\n${reviews}` : ""}`,
        },
      ],
    }),
  ]);

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "AI returned unexpected format." }, { status: 500 });
  }

  const product = JSON.parse(jsonMatch[0]);
  return NextResponse.json({
    ...product,
    amazon_asin: asin,
    amazon_image_urls,
    amazon_image_url: amazon_image_urls[0] ?? null,
  });
}
