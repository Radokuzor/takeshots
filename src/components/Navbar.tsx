"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

const links = [
  { label: "Play", href: "/play" },
  { label: "Shop", href: "/shop" },
  { label: "Near Me", href: "/near-me" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { items, setOpen: setCartOpen } = useCart();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-sm border-b-2 border-[#FF6B35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-black text-xl tracking-tight uppercase">
          TakeShots
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-semibold text-sm tracking-wide uppercase hover:text-[#FF6B35] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 hover:text-[#FF6B35] transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-[#FF6B35] text-white rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <Link href="/shop" className="btn-primary hidden sm:inline-flex text-sm py-2 px-5">
            Get 20% Off
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden bg-white border-t border-[#EDEBE5] px-4 pb-4">
          <div className="flex flex-col gap-4 pt-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-semibold text-sm tracking-wide uppercase"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/shop" className="btn-primary text-center text-sm">
              Get 20% Off
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
