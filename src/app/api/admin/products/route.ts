import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
  "Referer": "https://www.amazon.com/",
};

// Tries to upload to Supabase; falls back to the original CDN URL so images always show.
async function uploadFromUrl(imageUrl: string, asin: string | null, index = 0): Promise<string> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15000), headers: BROWSER_HEADERS });
    if (!res.ok) return imageUrl;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const filename = `amazon-${asin ?? Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await res.arrayBuffer());
    const supabase = admin();
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filename, buffer, { contentType, upsert: false });
    if (error) return imageUrl; // CDN fallback
    return supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
  } catch {
    return imageUrl; // CDN fallback
  }
}

async function uploadAllImages(imageUrls: string[], asin: string | null): Promise<string[]> {
  if (!imageUrls.length) return [];
  return Promise.all(imageUrls.map((url, i) => uploadFromUrl(url, asin, i)));
}

async function authCheck(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "1";
}

export async function POST(req: NextRequest) {
  if (!(await authCheck())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amazon_image_urls, amazon_image_url, ...payload } = await req.json();

  const allUrls: string[] = amazon_image_urls?.length
    ? amazon_image_urls
    : amazon_image_url
    ? [amazon_image_url]
    : [];

  if (allUrls.length && !payload.photo_url) {
    const uploaded = await uploadAllImages(allUrls, payload.amazon_asin ?? null);
    payload.photo_url = uploaded[0] ?? null;
    payload.photo_urls = uploaded;
  }

  // Keep occasion_tag in sync with first element of occasion_tags (backwards compat)
  if (payload.occasion_tags?.length) {
    payload.occasion_tag = payload.occasion_tags[0];
  }

  const { data, error } = await admin().from("products").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!(await authCheck())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { amazon_image_urls, amazon_image_url, ...payload } = await req.json();

  const allUrls: string[] = amazon_image_urls?.length
    ? amazon_image_urls
    : amazon_image_url
    ? [amazon_image_url]
    : [];

  // Only replace images if new ones are explicitly provided
  if (allUrls.length) {
    const uploaded = await uploadAllImages(allUrls, payload.amazon_asin ?? null);
    payload.photo_url = uploaded[0] ?? payload.photo_url;
    payload.photo_urls = uploaded;
  }

  // Keep occasion_tag in sync
  if (payload.occasion_tags?.length) {
    payload.occasion_tag = payload.occasion_tags[0];
  }

  const { data, error } = await admin().from("products").update(payload).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  if (!(await authCheck())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { error } = await admin().from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
