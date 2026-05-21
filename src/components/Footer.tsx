import Link from "next/link";

const shopLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Play", href: "/play" },
  { label: "Near Me", href: "/near-me" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.83 1.54V6.78a4.85 4.85 0 01-1.06-.09z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#EDEBE5] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-black text-xl uppercase tracking-tight mb-2">TakeShots</p>
            <p className="text-sm text-[#1A1A1A]/60">Gifts, games, and good times.</p>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-3">
            {shopLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold uppercase tracking-wide hover:text-[#FF6B35] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Social + CTA */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://tiktok.com/@takeshots"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:text-[#FF6B35] transition-colors"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://instagram.com/takeshots"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[#FF6B35] transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
            <Link href="/shop" className="btn-primary text-center text-sm w-fit">
              Get 20% Off
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1A1A1A]/50">
          <p>© 2026 TakeShots. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#1A1A1A] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#1A1A1A] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
