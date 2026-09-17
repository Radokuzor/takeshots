import Link from "next/link";
import GetDiscountButton from "@/components/GetDiscountButton";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "Take V2", href: "/#buy" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Reviews", href: "/#reviews" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Play Most Likely To", href: "/play" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
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

const socials = [
  { label: "TikTok", href: "https://tiktok.com/@takeshots", Icon: TikTokIcon },
  { label: "Instagram", href: "https://instagram.com/takeshots", Icon: InstagramIcon },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display font-extrabold text-2xl uppercase tracking-tight flex items-center gap-2 mb-3">
              <span aria-hidden className="inline-block w-7 h-7 rounded-lg bg-gradient-to-br from-coral to-coral-deep rotate-6" />
              TakeShots
            </p>
            <p className="text-white/60 max-w-xs mb-6">The Take V2 — one straw, every shot smoother.</p>
            <div className="flex flex-wrap items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-coral transition-colors"
                >
                  <Icon />
                </a>
              ))}
              <GetDiscountButton className="btn-primary !min-h-11 !py-2 text-sm ml-1">Get 20% Off</GetDiscountButton>
            </div>
          </div>

          {footerLinks.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40 mb-4">{col.title}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/80 hover:text-coral transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p
          aria-hidden
          className="font-display font-extrabold uppercase tracking-tighter leading-none text-center text-[14vw] xl:text-[11.5rem] mt-14 bg-gradient-to-b from-white/15 to-white/0 bg-clip-text text-transparent select-none"
        >
          TakeShots
        </p>

        <div className="mt-4 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
          <p>© {new Date().getFullYear()} TakeShots. All rights reserved.</p>
          <p>Please drink responsibly. 21+ only for alcoholic use.</p>
        </div>
      </div>
    </footer>
  );
}
