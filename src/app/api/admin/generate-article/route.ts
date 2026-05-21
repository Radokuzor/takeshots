import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, slug, category, city, author, prompt: userPrompt, productIds } = await req.json();
  if (!title || !slug || !userPrompt) {
    return NextResponse.json({ error: "Title, slug, and prompt are required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch selected products
  let products: Product[] = [];
  if (productIds?.length) {
    const { data } = await supabase.from("products").select("*").in("id", productIds);
    products = (data as Product[]) ?? [];
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const isNearMe = category === "near_me";
  const locationLine = isNearMe && city ? ` in ${city}` : "";

  const productCatalog = products.length
    ? `\n\nProducts to feature in this article (embed each one using its exact placeholder):\n${products
        .map(
          (p) =>
            `Placeholder: {{product:${p.id}}}\nName: ${p.name}\nPrice: $${p.price.toFixed(2)}\nDescription: ${p.description ?? "—"}`
        )
        .join("\n\n")}`
    : "";

  const embedInstruction = products.length
    ? `\n\nEMBED RULE: When referencing one of the listed products, place its placeholder (e.g. {{product:abc123}}) on its OWN LINE with a blank line before and after it. Use every provided product exactly once. The placeholder renders as a clickable product card automatically — do NOT write the product name as a heading when you embed it.`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3500,
    messages: [
      {
        role: "user",
        content: `Write a fun, engaging gift guide article for TakeShots.com${locationLine}. The site sells gifts and drinking game products for occasions like weddings, bachelorettes, birthdays, anniversaries, and game nights.

Article title: "${title}"
Article direction: ${userPrompt}${productCatalog}${embedInstruction}

Guidelines:
- Write in a fun, upbeat tone — like a knowledgeable friend giving gift advice
- Format as Markdown
- Structure: intro paragraph → featured products woven into the narrative with embeds → closing paragraph with call to action
- Keep descriptions specific and enthusiastic, not generic
- Do NOT include prices or external links — the product cards handle that
- Target length: ~600-900 words of prose (not counting embeds)

Return only the article body in Markdown. No frontmatter, no title heading.`,
      },
    ],
  });

  const body = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  if (!body) {
    return NextResponse.json({ error: "AI returned empty article." }, { status: 500 });
  }

  const payload = {
    title,
    slug,
    category: isNearMe ? "near_me" : "blog",
    city: isNearMe ? city || null : null,
    body,
    author: author || "TakeShots Team",
    last_updated: new Date().toISOString(),
    tags: products.map((p) => p.name).slice(0, 6),
    related_slugs: [],
  };

  const { data, error } = await supabase.from("articles").insert(payload).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
