import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ results: [] });

  if (type === "FILM") {
    const movies = await prisma.movie.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      orderBy: { popularity: "desc" },
      take: 8,
    });

    const results = movies.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : null,
      posterPath: m.posterPath,
    }));

    return NextResponse.json({ results });
  }

  if (type === "SHOW") {
    const shows = await prisma.show.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: { popularity: "desc" },
      take: 8,
    });

    const results = shows.map((s) => ({
      id: s.id,
      title: s.name,
      year: s.firstAirDate ? new Date(s.firstAirDate).getFullYear() : null,
      posterPath: s.posterPath,
    }));

    return NextResponse.json({ results });
  }

  if (type === "GAME") {
    const games = await prisma.game.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: { popularity: "desc" },
      take: 8,
    });

    const results = games.map((g) => ({
      id: g.id,
      title: g.name,
      year: g.releaseDate ? new Date(g.releaseDate).getFullYear() : null,
      posterPath: g.coverImageId,
    }));

    return NextResponse.json({ results });
  }

  if (type === "BOOK") {
    const books = await prisma.book.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      orderBy: { popularity: "desc" },
      take: 8,
    });

    const results = books.map((b) => ({
      id: b.id,
      title: b.title,
      year: b.firstPublishYear,
      posterPath: b.coverId ? String(b.coverId) : null,
    }));

    return NextResponse.json({ results });
  }

  return NextResponse.json({ results: [] });
}
