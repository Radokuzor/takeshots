import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TakeShots privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="headline mb-8">Privacy Policy</h1>
      <p className="text-[#1A1A1A]/50 text-sm mb-8">Last updated: May 18, 2026</p>

      <div className="prose prose-neutral max-w-none text-[#1A1A1A]/80 leading-relaxed flex flex-col gap-6">
        <section>
          <h2 className="font-black text-xl uppercase mb-2">Information We Collect</h2>
          <p>
            We collect information you provide directly — such as your email address when you subscribe to our
            list or create an account — and information collected automatically when you use our site, including
            IP addresses, browser type, and pages visited.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">How We Use Your Information</h2>
          <p>
            We use your information to fulfill orders, send discount codes and promotional emails (only if you
            opt in), improve our site, and comply with legal obligations. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Third-Party Services</h2>
          <p>
            We use Clerk for authentication, Supabase for data storage, Stripe for payments, and Vercel for
            hosting. Each of these services has their own privacy policy governing their use of your data.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Affiliate Disclosure</h2>
          <p>
            Some product links on TakeShots may be affiliate links. If you purchase through these links, we may
            earn a small commission at no extra cost to you.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Your Rights</h2>
          <p>
            You may request deletion of your personal data at any time by emailing us. If you are in the EU or
            California, you have additional rights under GDPR and CCPA respectively.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl uppercase mb-2">Contact</h2>
          <p>Questions? Email us at privacy@takeshots.com.</p>
        </section>
      </div>
    </div>
  );
}
