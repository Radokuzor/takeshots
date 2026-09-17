import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiscountModal from "@/components/DiscountModal";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Inter, Bricolage_Grotesque } from "next/font/google";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display-face",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://takeshots.com";

export const metadata: Metadata = {
  title: {
    default: "TakeShots — The Take V2 Shot Holder & Straw",
    template: "%s | TakeShots",
  },
  description:
    "The Take V2 is a patented shot holder & straw that turns every shot into a smooth, no-spill chaser. Plus Most Likely To, a free party game you can play right in the browser.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "TakeShots",
    type: "website",
    images: [
      {
        url: "https://m.media-amazon.com/images/I/71193Q2smAL._AC_SL1500_.jpg",
        width: 1500,
        height: 1500,
        alt: "The Take V2 shot holder and straw",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@takeshots",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TakeShots",
  url: SITE_URL,
  logo: "https://m.media-amazon.com/images/I/71193Q2smAL._AC_SL1500_.jpg",
  sameAs: ["https://tiktok.com/@takeshots", "https://instagram.com/takeshots"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TakeShots",
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${body.variable} ${display.variable}`}>
        <body className="bg-cream text-ink font-sans antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <AnalyticsTracker />
          <Navbar />
          <DiscountModal />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
