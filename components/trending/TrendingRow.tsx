import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MediaTag, { type MediaKind } from "@/components/landing/MediaTag";
import RatingStars from "@/components/landing/RatingStars";
import type { TrendingItem } from "@/lib/trending";

const labels: Record<MediaKind, string> = {
  film: "Movies",
  show: "TV Shows",
  game: "Games",
  book: "Books",
};

const hrefs: Record<MediaKind, string> = {
  film: "/movies",
  show: "/shows",
  game: "/games",
  book: "/books",
};

export default function TrendingRow({
  kind,
  items,
  title = "Trending in",
}: {
  kind: MediaKind;
  items: TrendingItem[];
  title?: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-paper">{title} {labels[kind]}</h2>
        <Link
          href={hrefs[kind]}
          className="flex items-center gap-1 text-sm font-medium text-paper-dim transition-colors hover:text-mint"
        >
          See all <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-2">
        {items.slice(0, 6).map((item) => (
          <Link key={item.href} href={item.href} className="flex w-[170px] shrink-0 flex-col gap-3 hover:opacity-80">
            <div className="aspect-[280/406] w-full overflow-hidden rounded-xl border border-ink-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.cover} alt={item.title} className="size-full object-cover" />
            </div>
            <div className="flex items-center justify-between">
              <MediaTag kind={kind} />
              <span className="text-xs text-paper-faint">{item.year}</span>
            </div>
            <p className="truncate font-semibold text-paper">{item.title}</p>
            <div className="flex items-center justify-between">
              <RatingStars filled={item.rating} size={12} />
              {(item.tracking ?? 0) > 0 && (
                <span className="text-[11px] text-mint">{item.tracking} tracking</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
