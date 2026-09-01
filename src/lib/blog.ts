import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  tag: string;
  readingMinutes: number;
  body: string; // markdown
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

/**
 * Minimal frontmatter parser — avoids pulling in gray-matter for a handful of
 * fields. Expects a leading `---` block of `key: value` pairs (values may be
 * wrapped in single or double quotes), then the markdown body.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    data[kv[1]] = kv[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return { data, body: match[2].trim() };
}

function readPost(fileName: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, body } = parseFrontmatter(raw);
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: data.title ?? fileName,
    description: data.description ?? "",
    date: data.date ?? "1970-01-01",
    tag: data.tag ?? "Blog",
    readingMinutes: Math.max(1, Math.round(words / 200)),
    body,
  };
}

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readPost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
