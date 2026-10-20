import { prisma } from "@/lib/prisma";

export type CatalogType = "FILM" | "SHOW" | "GAME" | "BOOK";
export type SortKey = "popular" | "rating" | "new" | "az";

export type GridItem = {
  title: string;
  year: string;
  cover: string;
  rating: number; // 1-5 stars
  href: string;
};

export const SORT_KEYS: SortKey[] = ["popular", "rating", "new", "az"];
export const parseSort = (v: string | null | undefined): SortKey =>
  SORT_KEYS.includes(v as SortKey) ? (v as SortKey) : "popular";

// Nulls last, otherwise Postgres puts rows with no value first in a descending sort.
const desc = { sort: "desc" as const, nulls: "last" as const };

const yearOf = (d: Date | null) => (d ? String(new Date(d).getFullYear()) : "—");
const placeholder = (id: string) => `https://picsum.photos/seed/${id}/400/580`;

/**
 * One query for all four catalogs: optional title search + sort + paging.
 * Used by the category pages, the Load More / filter / search API, and Trending search.
 */
export async function queryCatalog({
  type,
  q = "",
  sort = "popular",
  skip = 0,
  take = 20,
}: {
  type: CatalogType;
  q?: string;
  sort?: SortKey;
  skip?: number;
  take?: number;
}): Promise<GridItem[]> {
  const term = q.trim();
  const contains = (field: string) => ({ [field]: { contains: term, mode: "insensitive" as const } });

  if (type === "FILM") {
    const rows = await prisma.movie.findMany({
      where: term ? { OR: [contains("title"), contains("originalTitle")] } : undefined,
      orderBy:
        sort === "rating"
          ? { voteAverage: desc }
          : sort === "new"
            ? { releaseDate: desc }
            : sort === "az"
              ? { title: "asc" }
              : { popularity: desc },
      skip,
      take,
    });
    return rows.map((m) => ({
      title: m.title,
      year: yearOf(m.releaseDate),
      cover: m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : placeholder(m.id),
      rating: m.voteAverage ? Math.max(1, Math.round(m.voteAverage / 2)) : 3,
      href: `/movies/${m.id}`,
    }));
  }

  if (type === "SHOW") {
    const rows = await prisma.show.findMany({
      where: term ? { OR: [contains("name"), contains("originalName")] } : undefined,
      orderBy:
        sort === "rating"
          ? { voteAverage: desc }
          : sort === "new"
            ? { firstAirDate: desc }
            : sort === "az"
              ? { name: "asc" }
              : { popularity: desc },
      skip,
      take,
    });
    return rows.map((s) => ({
      title: s.name,
      year: yearOf(s.firstAirDate),
      cover: s.posterPath ? `https://image.tmdb.org/t/p/w500${s.posterPath}` : placeholder(s.id),
      rating: s.voteAverage ? Math.max(1, Math.round(s.voteAverage / 2)) : 3,
      href: `/shows/${s.id}`,
    }));
  }

  if (type === "GAME") {
    const rows = await prisma.game.findMany({
      where: term ? contains("name") : undefined,
      orderBy:
        sort === "rating"
          ? { rating: desc }
          : sort === "new"
            ? { releaseDate: desc }
            : sort === "az"
              ? { name: "asc" }
              : { popularity: desc },
      skip,
      take,
    });
    return rows.map((g) => ({
      title: g.name,
      year: yearOf(g.releaseDate),
      cover: g.coverImageId
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`
        : placeholder(g.id),
      rating: g.rating ? Math.max(1, Math.round(g.rating / 20)) : 3,
      href: `/games/${g.id}`,
    }));
  }

  const rows = await prisma.book.findMany({
    where: term ? { OR: [contains("title"), contains("authors")] } : undefined,
    orderBy:
      sort === "rating"
        ? { rating: desc }
        : sort === "new"
          ? { firstPublishYear: desc }
          : sort === "az"
            ? { title: "asc" }
            : { popularity: desc },
    skip,
    take,
  });
  return rows.map((b) => ({
    title: b.title,
    year: b.firstPublishYear ? String(b.firstPublishYear) : "—",
    cover: b.coverId ? `https://covers.openlibrary.org/b/id/${b.coverId}-L.jpg` : placeholder(b.id),
    rating: b.rating ? Math.max(1, Math.round(b.rating)) : 3,
    href: `/books/${b.id}`,
  }));
}
