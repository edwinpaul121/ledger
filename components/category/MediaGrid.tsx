import Link from "next/link";
import type { MediaKind } from "@/components/landing/MediaTag";
import MediaTag from "@/components/landing/MediaTag";
import RatingStars from "@/components/landing/RatingStars";

export type GridItem = {
  title: string;
  year: string;
  cover: string;
  rating: number;
  href?: string;
};

export default function MediaGrid({
  kind,
  items,
  emptyMessage = "Nothing here yet.",
}: {
  kind: MediaKind;
  items: GridItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-paper-faint">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, i) => {
        const content = (
          <>
            <div className="aspect-[280/406] w-full overflow-hidden rounded-xl border border-ink-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.cover} alt={item.title} className="size-full object-cover" />
            </div>
            <div className="flex items-center justify-between">
              <MediaTag kind={kind} />
              <span className="text-xs text-paper-faint">{item.year}</span>
            </div>
            <p className="truncate font-semibold text-paper">{item.title}</p>
            <RatingStars filled={item.rating} />
          </>
        );

        return item.href ? (
          <Link key={item.href} href={item.href} className="flex flex-col gap-3">
            {content}
          </Link>
        ) : (
          <div key={`${item.title}-${i}`} className="flex flex-col gap-3">
            {content}
          </div>
        );
      })}
    </div>
  );
}
