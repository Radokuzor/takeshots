import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAllPosts, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | TakeShots`,
    description: post.description,
    openGraph: { title: `${post.title} | TakeShots`, description: post.description },
  };
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h2: ({ children }) => (
    <h2 className="font-black text-2xl uppercase tracking-tight mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="font-bold text-xl mt-8 mb-3">{children}</h3>,
  p: ({ children }) => (
    <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 flex flex-col gap-2 text-[#1A1A1A]/80">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 flex flex-col gap-2 text-[#1A1A1A]/80">{children}</ol>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-[#FF6B35] font-semibold hover:underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#FF6B35] pl-4 italic text-[#1A1A1A]/70 my-6">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => <strong className="font-bold text-[#1A1A1A]">{children}</strong>,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B35] hover:underline"
      >
        <ArrowLeft size={15} /> Back to Blog
      </Link>

      <div className="mt-5 mb-8">
        <span className="tag mb-4 inline-block">{post.tag}</span>
        <h1 className="headline text-3xl md:text-5xl mb-3">{post.title}</h1>
        <p className="text-[#1A1A1A]/45 text-sm">
          {formatDate(post.date)} · {post.readingMinutes} min read
        </p>
      </div>

      <article>
        <ReactMarkdown components={mdComponents}>{post.body}</ReactMarkdown>
      </article>

      {/* CTA */}
      <div
        className="mt-12 rounded-3xl p-8 text-center text-white"
        style={{ background: "linear-gradient(135deg, #FF6B35, #FF4500)" }}
      >
        <h2 className="font-black text-2xl uppercase mb-2">Take Shots Like Never Before</h2>
        <p className="text-white/80 mb-5">
          The Take V2 turns every shot into a smooth, no-spill chaser. $19.99, ships to the US &amp; Canada.
        </p>
        <Link href="/" className="btn-primary bg-white !text-[#FF4500] inline-flex">
          Get the Take V2
        </Link>
      </div>
    </div>
  );
}
