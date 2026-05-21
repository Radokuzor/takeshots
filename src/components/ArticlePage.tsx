"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import type { Article, Product } from "@/lib/types";
import EmailCapture from "./EmailCapture";
import ProductEmbed from "./ProductEmbed";

interface Props {
  article: Article;
  relatedArticles: Article[];
  embeddedProducts?: Product[];
}

const PRODUCT_PLACEHOLDER = /(\{\{product:[a-f0-9-]+\}\})/g;

function useTOC(body: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = body.split("\n");
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) {
      const text = m[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      headings.push({ id, text, level: m[1].length });
    }
  }
  return headings;
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h2: ({ children }) => {
    const text = String(children);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return <h2 id={id} className="font-black text-2xl uppercase mt-10 mb-4">{children}</h2>;
  },
  h3: ({ children }) => {
    const text = String(children);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return <h3 id={id} className="font-bold text-xl mt-6 mb-3">{children}</h3>;
  },
  p: ({ children }) => <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 flex flex-col gap-1.5">{children}</ul>,
  a: ({ href, children }) => (
    <a href={href} className="text-[#FF6B35] font-semibold hover:underline">{children}</a>
  ),
};

function ArticleBody({ body, productMap }: { body: string; productMap: Map<string, Product> }) {
  const parts = body.split(PRODUCT_PLACEHOLDER);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{product:([a-f0-9-]+)\}\}$/);
        if (match) {
          const product = productMap.get(match[1]);
          return product ? <ProductEmbed key={i} product={product} /> : null;
        }
        if (!part.trim()) return null;
        return (
          <ReactMarkdown key={i} components={mdComponents}>
            {part}
          </ReactMarkdown>
        );
      })}
    </>
  );
}

export default function ArticlePage({ article, relatedArticles, embeddedProducts = [] }: Props) {
  const toc = useTOC(article.body ?? "");
  const [showPopup, setShowPopup] = useState(false);
  const popupShown = useRef(false);
  const productMap = new Map(embeddedProducts.map((p) => [p.id, p]));

  useEffect(() => {
    const handleScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct >= 0.5 && !popupShown.current) {
        popupShown.current = true;
        setShowPopup(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <span className="tag mb-3 inline-block">{article.category === "near_me" ? "Near Me" : "Blog"}</span>
        <h1 className="headline text-3xl md:text-5xl mb-3">{article.title}</h1>
        <p className="text-[#1A1A1A]/50 text-sm">
          By {article.author} · Last updated{" "}
          {new Date(article.last_updated).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex gap-12">
        {/* Sidebar TOC */}
        {toc.length > 0 && (
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24">
              <p className="font-bold text-xs uppercase tracking-widest mb-4 text-[#1A1A1A]/50">Contents</p>
              <nav className="flex flex-col gap-2">
                {toc.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`text-sm hover:text-[#FF6B35] transition-colors ${
                      h.level === 3 ? "pl-4 text-[#1A1A1A]/60" : "font-semibold"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Article body */}
        <article className="flex-1 min-w-0 prose prose-neutral max-w-none">
          <ArticleBody body={article.body ?? ""} productMap={productMap} />
        </article>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[#EDEBE5]">
          <h2 className="font-black text-xl uppercase mb-6">Keep Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedArticles.map((a) => (
              <Link
                key={a.id}
                href={`/${a.category === "near_me" ? "near-me" : "blog"}/${a.slug}`}
                className="card p-5 group"
              >
                <span className="tag mb-2 inline-block text-[10px]">
                  {a.category === "near_me" ? "Near Me" : "Blog"}
                </span>
                <h3 className="font-bold text-sm leading-snug group-hover:text-[#FF6B35] transition-colors">
                  {a.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 50% scroll email popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#F5F4F0] rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors text-xl"
            >
              ✕
            </button>
            <h3 className="font-black text-2xl uppercase mb-2">Get 20% Off</h3>
            <p className="text-[#1A1A1A]/70 text-sm mb-5">
              Drop your email and we&apos;ll send a discount code straight to your inbox.
            </p>
            <EmailCapture source="popup" />
          </div>
        </div>
      )}
    </div>
  );
}
