"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import GetDiscountButton from "@/components/GetDiscountButton";

const links = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
  { label: "Play", href: "/play" },
  { label: "About", href: "/about" },
];

function isActiveLink(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation, and lock page scroll while it's open
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-ink text-white text-[11px] sm:text-xs font-semibold tracking-wide text-center px-4 py-2">
        <span className="text-coral">★ 4.2</span> from 300+ Amazon reviews
        <span className="hidden sm:inline"> · Ships to the US &amp; Canada</span>
      </div>

      <div
        className={`transition-all duration-300 ${
          scrolled || open
            ? "bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-cream/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="font-display font-extrabold text-xl tracking-tight uppercase flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block w-7 h-7 rounded-lg bg-gradient-to-br from-coral to-coral-deep rotate-6"
            />
            TakeShots
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-full font-semibold text-sm transition-colors ${
                  isActiveLink(pathname, l.href)
                    ? "text-coral-deep bg-coral/10"
                    : "text-ink/75 hover:text-ink hover:bg-ink/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <GetDiscountButton className="hidden md:inline-flex text-sm font-semibold text-ink/75 hover:text-ink px-3 py-2">
              Get 20% Off
            </GetDiscountButton>
            <Link href="/#buy" className="btn-primary hidden sm:inline-flex !min-h-0 !py-2.5 !px-5 text-sm">
              Shop Take V2 <ArrowRight size={16} />
            </Link>

            <button
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-full hover:bg-ink/5"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-[6.25rem] sm:top-[6.5rem] bg-white overflow-y-auto">
          <nav className="px-4 pt-2 pb-8 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-4 border-b border-ink/5 font-display font-extrabold text-2xl uppercase tracking-tight ${
                  isActiveLink(pathname, l.href) ? "text-coral-deep" : ""
                }`}
              >
                {l.label}
                <ArrowRight size={20} className="text-ink/30" />
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-8">
              <Link href="/#buy" onClick={() => setOpen(false)} className="btn-primary w-full">
                Shop Take V2 — $19.99
              </Link>
              <GetDiscountButton className="btn-ghost w-full">Get 20% Off</GetDiscountButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
