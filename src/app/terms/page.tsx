import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "TakeShots terms of service — the rules for using our site and services.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="headline mb-8">Terms of Service</h1>
      <p className="text-[#1A1A1A]/50 text-sm mb-8">Last updated: May 18, 2026</p>

      <div className="prose prose-neutral max-w-none text-[#1A1A1A]/80 leading-relaxed flex flex-col gap-6">
        <section>
          <h2 className="font-black text-xl uppercase mb-2">Acceptance of Terms</h2>
          <p>
            By accessing or using TakeShots.com, you agree to be bound by these Terms of Service. If you do
            not agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Products & Orders</h2>
          <p>
            All sales are final. We work with Amazon to fulfill orders and are not responsible for shipping
            delays, product defects, or issues handled by Amazon. Contact Amazon directly for returns and
            refunds on fulfilled items.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Discount Codes</h2>
          <p>
            Discount codes are limited to one per customer. Codes are non-transferable and cannot be combined
            with other offers. We reserve the right to revoke codes at any time.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Game Use</h2>
          <p>
            The TakeShots game is intended for adults 21+. TakeShots is not responsible for any consequences
            of game play, including alcohol consumption. Please drink responsibly.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Intellectual Property</h2>
          <p>
            All content on TakeShots.com — including text, graphics, logos, and game content — is owned by
            TakeShots and protected by copyright law.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Contact</h2>
          <p>Questions? Email us at legal@takeshots.com.</p>
        </section>
      </div>
    </div>
  );
}
