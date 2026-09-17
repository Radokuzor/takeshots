import { Star, BadgeCheck } from "lucide-react";

export interface Review {
  stars: number;
  title: string;
  body: string;
  author: string;
  date: string;
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="w-[280px] sm:w-[340px] shrink-0 bg-white rounded-3xl p-6 flex flex-col gap-3 border border-ink/5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-0.5 text-coral" aria-label={`${r.stars} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={15} fill={i < r.stars ? "currentColor" : "none"} strokeWidth={i < r.stars ? 0 : 1.5} />
        ))}
      </div>
      <p className="font-bold leading-snug">{r.title}</p>
      <blockquote className="text-sm text-ink/70 leading-relaxed line-clamp-5 flex-1">{r.body}</blockquote>
      <figcaption className="flex items-center gap-3 pt-3 border-t border-ink/5">
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-coral-deep text-white font-bold text-sm flex items-center justify-center">
          {r.author.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-sm font-semibold truncate">
            {r.author}
            <BadgeCheck size={14} className="text-coral-deep shrink-0" aria-label="Verified purchase" />
          </span>
          <span className="block text-xs text-ink/50">{r.date}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// Two rows scrolling in opposite directions; pauses on hover, static + swipeable with reduced motion.
export default function ReviewMarquee({ reviews }: { reviews: Review[] }) {
  const half = Math.ceil(reviews.length / 2);
  const rows = [reviews.slice(0, half + 1), reviews.slice(half - 1)];

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, idx) => (
        <div key={idx} className="marquee marquee-fade overflow-hidden">
          <div
            className="marquee-track gap-4 pr-4 py-1"
            data-reverse={idx === 1 ? "" : undefined}
            style={{ "--marquee-duration": `${row.length * 9}s` } as React.CSSProperties}
          >
            {[...row, ...row].map((r, i) => (
              <div key={`${r.title}-${i}`} aria-hidden={i >= row.length || undefined}>
                <ReviewCard r={r} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
