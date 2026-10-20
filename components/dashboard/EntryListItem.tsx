import Link from "next/link";
import type { ReactNode } from "react";
import MediaTag from "@/components/landing/MediaTag";
import type { MediaType } from "./types";

export type CatalogRef = {
  id: string;
  movieId: string | null;
  showId: string | null;
  gameId: string | null;
  bookId: string | null;
  moviePosterPath: string | null; // holds the poster/cover reference for whichever catalog item is set
  mediaType: MediaType | null;
  title: string;
};

const ROUTE_PREFIX: Partial<Record<MediaType, string>> = {
  FILM: "/movies",
  SHOW: "/shows",
  GAME: "/games",
  BOOK: "/books",
};

function getItemHref(entry: CatalogRef): string | null {
  const refId = entry.movieId ?? entry.showId ?? entry.gameId ?? entry.bookId;
  if (!refId || !entry.mediaType) return null;
  const prefix = ROUTE_PREFIX[entry.mediaType];
  return prefix ? `${prefix}/${refId}` : null;
}

// TMDB (movies/shows), IGDB (games) and Open Library (books) use different image hosts and URL shapes.
function getPosterUrl(entry: CatalogRef): string | null {
  if (!entry.moviePosterPath) return null;
  if (entry.mediaType === "GAME") {
    return `https://images.igdb.com/igdb/image/upload/t_cover_small/${entry.moviePosterPath}.jpg`;
  }
  if (entry.mediaType === "BOOK") {
    return `https://covers.openlibrary.org/b/id/${entry.moviePosterPath}-M.jpg`;
  }
  return `https://image.tmdb.org/t/p/w185${entry.moviePosterPath}`;
}

export default function EntryListItem({
  entry,
  meta,
  action,
}: {
  entry: CatalogRef;
  meta?: string;
  action?: ReactNode;
}) {
  const href = getItemHref(entry);
  const poster = getPosterUrl(entry);

  const identity = (
    <>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={entry.title}
          className="h-16 w-11 shrink-0 rounded-md border border-ink-line object-cover"
        />
      ) : entry.mediaType ? (
        <MediaTag kind={entry.mediaType.toLowerCase() as "film" | "show" | "game" | "book"} />
      ) : (
        <span className="h-4 w-11 shrink-0 rounded bg-ink-line" />
      )}
      <span className="truncate font-medium text-paper">{entry.title}</span>
    </>
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-line bg-ink-soft px-4 py-3">
      {href ? (
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
          {identity}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{identity}</div>
      )}

      <div className="flex shrink-0 items-center gap-3">
        {meta && <span className="text-xs text-paper-faint">{meta}</span>}
        {action}
      </div>
    </div>
  );
}
