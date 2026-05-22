import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import DiscountModal from "@/components/DiscountModal";

export const metadata: Metadata = {
  title: {
    default: "TakeShots — Gifts for Every Occasion",
    template: "%s | TakeShots",
  },
  description:
    "Discover the best gifts for bachelorette parties, birthdays, anniversaries, game nights, weddings, and holidays.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://takeshots.com"),
  openGraph: {
    siteName: "TakeShots",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#F5F4F0] text-[#1A1A1A] antialiased">
          <Navbar />
          <CartDrawer />
          <DiscountModal />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
