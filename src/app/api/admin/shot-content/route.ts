import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, limit as fbLimit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toSlug, type ShotContentType } from "@/lib/shotContent";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "1";
}

function buildPrompt(type: ShotContentType, topic: string, userPrompt: string) {
  if (type === "recipe") {
    return `Create a shot recipe for TakeShots.com's "Shots" guide — an SEO reference for shot recipes and drinking info. The spirit/theme is: ${topic}.

Direction: ${userPrompt}

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "title": "string, e.g. 'Kamikaze Shot Recipe'",
  "metaDescription": "string, 1 sentence, under 160 characters, for search engine snippets",
  "spirit": "string, the primary spirit, e.g. 'Vodka'",
  "ingredients": ["string", "..."],
  "instructions": ["string, one step per array item", "..."],
  "tags": ["string", "..."]
}`;
  }
  return `Write an SEO reference article for TakeShots.com's "Shots" guide, a hub of informational content about shots, spirits, and drinking. Topic: ${topic}.

Direction: ${userPrompt}

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "title": "string, SEO-friendly title",
  "metaDescription": "string, 1 sentence, under 160 characters, for search engine snippets",
  "body": "string, the full article in Markdown using ## and ### headings, 500-900 words, no emojis",
  "tags": ["string", "..."]
}`;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, topic, prompt: userPrompt, title: providedTitle, slug: providedSlug } =
    (await req.json()) as {
      type: ShotContentType;
      topic: string;
      prompt: string;
      title?: string;
      slug?: string;
    };

  if (!type || !topic || !userPrompt) {
    return NextResponse.json({ error: "type, topic, and prompt are required" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: buildPrompt(type, topic, userPrompt) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  if (!raw) {
    return NextResponse.json({ error: "AI returned empty content." }, { status: 500 });
  }

  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON." }, { status: 500 });
  }

  const title = providedTitle || (parsed.title as string) || topic;
  const slug = providedSlug || toSlug(title);
  const now = new Date().toISOString();

  const docData = {
    type,
    title,
    slug,
    metaDescription: (parsed.metaDescription as string) ?? "",
    tags: (parsed.tags as string[]) ?? [],
    createdAt: now,
    updatedAt: now,
    ...(type === "guide"
      ? { body: (parsed.body as string) ?? "" }
      : {
          spirit: (parsed.spirit as string) ?? topic,
          ingredients: (parsed.ingredients as string[]) ?? [],
          instructions: (parsed.instructions as string[]) ?? [],
        }),
  };

  const existing = await getDocs(
    query(collection(db, "shot_content"), where("slug", "==", slug), fbLimit(1))
  );
  if (!existing.empty) {
    return NextResponse.json({ error: `Slug "${slug}" is already in use.` }, { status: 409 });
  }

  const ref = await addDoc(collection(db, "shot_content"), docData);
  return NextResponse.json({ id: ref.id, ...docData });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await deleteDoc(doc(db, "shot_content", id));
  return NextResponse.json({ success: true });
}
