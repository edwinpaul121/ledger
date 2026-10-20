import { prisma } from "@/lib/prisma";

export type TrendingItem = {
  title: string;
  year: string;
  cover: string;
  rating: number;
  href: string;
  tracking?: number; // how many users added/updated it in the window
};

const WINDOW_DAYS = 7;
const LIMIT = 6;

type Id = string;

// Most-tracked catalog ids over the last week, from real user activity.
// Counted in JS over a bounded slice of recent entries (simple + type-safe).
async function recentActivity() {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.entry.findMany({
    where: { updatedAt: { gte: since } },
    select: { movieId: true, showId: true, gameId: true, bookId: true },
    take: 5000,
  });

  const tally = (pick: (r: (typeof rows)[number]) => string | null) => {
    const counts = new Map<Id, number>();
    for (const r of rows) {
      const id = pick(r);
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return new Map([...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, LIMIT));
  };

  return {
    mc: tally((r) => r.movieId),
    sc: tally((r) => r.showId),
    gc: tally((r) => r.gameId),
    bc: tally((r) => r.bookId),
  };
}

// Community activity first, topped up with the API-sourced popularity ranking.
function merge<T extends { id: string }>(tracked: T[], popular: T[]) {
  const seen = new Set(tracked.map((t) => t.id));
  return [...tracked, ...popular.filter((p) => !seen.has(p.id))].slice(0, LIMIT);
}

const stars = (v: number | null | undefined, scale: number) =>
  v ? Math.max(1, Math.round(v / scale)) : 3;

export async function getTrending() {
  const { mc, sc, gc, bc } = await recentActivity();

  const [movies, shows, games, books] = await Promise.all([
    prisma.movie.findMany({ where: { id: { in: [...mc.keys()] } } }),
    prisma.show.findMany({ where: { id: { in: [...sc.keys()] } } }),
    prisma.game.findMany({ where: { id: { in: [...gc.keys()] } } }),
    prisma.book.findMany({ where: { id: { in: [...bc.keys()] } } }),
  ]);
  const [pm, ps, pg, pb] = await Promise.all([
    prisma.movie.findMany({ orderBy: { popularity: "desc" }, take: LIMIT }),
    prisma.show.findMany({ orderBy: { popularity: "desc" }, take: LIMIT }),
    prisma.game.findMany({ orderBy: { popularity: "desc" }, take: LIMIT }),
    prisma.book.findMany({ orderBy: { popularity: "desc" }, take: LIMIT }),
  ]);

  const byCount = <T extends { id: string }>(rows: T[], counts: Map<Id, number>) =>
    [...rows].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));

  const film: TrendingItem[] = merge(byCount(movies, mc), pm).map((m) => ({
    title: m.title,
    year: m.releaseDate ? String(new Date(m.releaseDate).getFullYear()) : "—",
    cover: m.posterPath
      ? `https://image.tmdb.org/t/p/w500${m.posterPath}`
      : `https://picsum.photos/seed/${m.id}/400/580`,
    rating: stars(m.voteAverage, 2),
    href: `/movies/${m.id}`,
    tracking: mc.get(m.id) ?? 0,
  }));

  const show: TrendingItem[] = merge(byCount(shows, sc), ps).map((s) => ({
    title: s.name,
    year: s.firstAirDate ? String(new Date(s.firstAirDate).getFullYear()) : "—",
    cover: s.posterPath
      ? `https://image.tmdb.org/t/p/w500${s.posterPath}`
      : `https://picsum.photos/seed/${s.id}/400/580`,
    rating: stars(s.voteAverage, 2),
    href: `/shows/${s.id}`,
    tracking: sc.get(s.id) ?? 0,
  }));

  const game: TrendingItem[] = merge(byCount(games, gc), pg).map((g) => ({
    title: g.name,
    year: g.releaseDate ? String(new Date(g.releaseDate).getFullYear()) : "—",
    cover: g.coverImageId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`
      : `https://picsum.photos/seed/${g.id}/400/580`,
    rating: stars(g.rating, 20),
    href: `/games/${g.id}`,
    tracking: gc.get(g.id) ?? 0,
  }));

  const book: TrendingItem[] = merge(byCount(books, bc), pb).map((b) => ({
    title: b.title,
    year: b.firstPublishYear ? String(b.firstPublishYear) : "—",
    cover: b.coverId
      ? `https://covers.openlibrary.org/b/id/${b.coverId}-L.jpg`
      : `https://picsum.photos/seed/${b.id}/400/580`,
    rating: stars(b.rating, 1),
    href: `/books/${b.id}`,
    tracking: bc.get(b.id) ?? 0,
  }));

  return { film, show, game, book };
}
