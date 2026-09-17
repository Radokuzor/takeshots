import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game in Progress",
  robots: { index: false, follow: false },
};

export default function GameCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
