import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host a Game",
  robots: { index: false, follow: false },
};

export default function CreateGameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
