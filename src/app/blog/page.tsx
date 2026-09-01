import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Shot Tips, Chaser Guides & Party Hacks | TakeShots",
  description:
    "How to take shots without the burn, the best chasers for every liquor, wellness-shot hacks, and party tricks — quick reads from the TakeShots crew.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <span className="tag mb-4 inline-block">The TakeShots Blog</span>
      <h1 className="headline mb-3">Shots, Chasers &amp; Party Hacks</h1>
      <p className="text-[#1A1A1A]/60 text-lg mb-10 max-w-xl">
        Quick reads on taking shots smoother, chasing smarter, and keeping the party going.
      </p>

      {posts.length === 0 ? (
        <p className="text-[#1A1A1A]/50">Posts coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="card p-6 group flex flex-col gap-3"
            >
              <span className="tag text-[10px] w-fit">{p.tag}</span>
              <h2 className="font-black text-xl leading-snug group-hover:text-[#FF6B35] transition-colors">
                {p.title}
              </h2>
              <p className="text-[#1A1A1A]/60 text-sm leading-relaxed line-clamp-3">
                {p.description}
              </p>
              <p className="text-[#1A1A1A]/40 text-xs mt-auto pt-2">
                {formatDate(p.date)} · {p.readingMinutes} min read
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
