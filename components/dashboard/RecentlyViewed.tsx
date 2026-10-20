import Link from "next/link";
import type { ViewHistoryEntry } from "./types";

export default function RecentlyViewed({ entries }: { entries: ViewHistoryEntry[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl text-paper">Recently viewed</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-paper-faint">
          Nothing viewed yet — browse around and it&apos;ll show up here.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {entries.map((entry) => {
            const poster = !entry.moviePosterPath
              ? null
              : entry.path.startsWith("/games")
                ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${entry.moviePosterPath}.jpg`
                : entry.path.startsWith("/books")
                  ? `https://covers.openlibrary.org/b/id/${entry.moviePosterPath}-M.jpg`
                  : `https://image.tmdb.org/t/p/w185${entry.moviePosterPath}`;
            return (
              <Link
                key={entry.id}
                href={entry.path}
                className="flex w-[260px] shrink-0 items-center gap-3 rounded-xl border border-ink-line bg-ink-soft px-4 py-3 hover:opacity-80"
              >
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster}
                    alt={entry.title}
                    className="h-16 w-11 shrink-0 rounded-md border border-ink-line object-cover"
                  />
                ) : (
                  <span className="h-16 w-11 shrink-0 rounded-md bg-ink-line" />
                )}
                <span className="truncate font-medium text-paper">{entry.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
