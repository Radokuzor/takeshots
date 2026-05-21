import type { Metadata } from "next";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Play the TakeShots Game",
  description: "A fun drinking game you can play with friends or strangers. Coming soon.",
};

export default function PlayPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <span className="text-6xl mb-6">🎮</span>
      <h1 className="headline mb-4">Something fun is coming.</h1>
      <p className="text-[#1A1A1A]/70 text-lg max-w-md mb-10">
        The TakeShots game is almost ready. Be first to play — drop your email and we&apos;ll
        hit you when it goes live.
      </p>
      <EmailCapture source="play_page" />
    </div>
  );
}
