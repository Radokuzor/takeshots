"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import GetDiscountButton from "@/components/GetDiscountButton";
import HomeBuyButton from "@/components/HomeBuyButton";
import { TAKE_V2 } from "@/lib/product";

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

function Logo() {
  return (
    <Link href="/" className="font-display font-extrabold text-xl tracking-tight uppercase flex items-center gap-2">
      <span aria-hidden className="inline-block w-7 h-7 rounded-lg bg-gradient-to-br from-coral to-coral-deep rotate-6" />
      TakeShots
    </Link>
  );
}

function BuyButton({ floating }: { floating?: boolean }) {
  return (
    <HomeBuyButton
      compact
      name={TAKE_V2.name}
      price={TAKE_V2.price}
      photoUrl={TAKE_V2.photoUrl}
      className={`btn-primary !min-h-0 !py-2.5 !px-4 sm:!px-5 text-sm ${floating ? "!shadow-[0_10px_30px_-6px_rgba(255,69,0,0.6)]" : ""}`}
    />
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [headerGone, setHeaderGone] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  // Already mid-purchase (or in the admin view) — a Buy button would just reset the order.
  const showBuy = !pathname.startsWith("/checkout") && !pathname.startsWith("/admin");

  // The header scrolls away normally; only the Buy button stays pinned once it's gone.
  useEffect(() => {
    const onScroll = () => {
      const header = headerRef.current;
      if (header) setHeaderGone(header.getBoundingClientRect().bottom < 8);
    };
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
    <>
      <header ref={headerRef} className="relative z-50">
        {/* Announcement bar */}
        <div className="bg-ink text-white text-[11px] sm:text-xs font-semibold tracking-wide text-center px-4 py-2">
          <span className="text-coral">★ 4.2</span> from 300+ Amazon reviews
          <span className="hidden sm:inline"> · Ships to the US &amp; Canada</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Logo />

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
            {showBuy && (
              <div className={headerGone ? "invisible" : ""}>
                <BuyButton />
              </div>
            )}
            <button
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-full hover:bg-ink/5"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Buy button — sits where the header's button was, so it reads as the same button staying put */}
      {showBuy && (
        <div
          aria-hidden={!headerGone}
          className={`fixed top-3 inset-x-0 z-40 pointer-events-none transition-all duration-200 ${
            headerGone ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-end">
            <div className={headerGone ? "pointer-events-auto" : ""}>
              <BuyButton floating />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white overflow-y-auto">
          <div className="px-4 flex items-center justify-between h-16">
            <Logo />
            <button
              className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full hover:bg-ink/5"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
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
              {showBuy && (
                <HomeBuyButton
                  compact
                  name={TAKE_V2.name}
                  price={TAKE_V2.price}
                  photoUrl={TAKE_V2.photoUrl}
                  className="btn-primary w-full"
                />
              )}
              <GetDiscountButton className="btn-ghost w-full">Get 20% Off</GetDiscountButton>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
