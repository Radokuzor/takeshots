import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Bars Near Me — Bachelorette & Birthday Venues",
  description: "Hand-picked bars and venues for bachelorettes, birthdays, and big nights out in Austin, Houston, and Dallas.",
};

const cities = [
  { name: "Austin", slug: "austin", description: "Sixth Street, Rainey Street & beyond" },
  { name: "Houston", slug: "houston", description: "Montrose, Midtown & the best dive bars" },
  { name: "Dallas", slug: "dallas", description: "Deep Ellum, Uptown & Lower Greenville" },
];

export default function NearMeIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="headline mb-4">Find the Best Bars Near You</h1>
      <p className="text-[#1A1A1A]/70 text-lg mb-10 max-w-xl">
        Hand-picked bars and venues for bachelorettes, birthdays, and big nights out.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/near-me/${city.slug}`}
            className="card p-8 group flex flex-col gap-2"
          >
            <span className="font-black text-3xl uppercase group-hover:text-[#FF6B35] transition-colors">
              {city.name}
            </span>
            <span className="text-[#1A1A1A]/60 text-sm">{city.description}</span>
            <span className="text-[#FF6B35] font-bold text-sm mt-3">View Guide →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
