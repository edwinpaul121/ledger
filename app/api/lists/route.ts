import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const posterInclude = {
  movie: { select: { posterPath: true } },
  show: { select: { posterPath: true } },
  game: { select: { coverImageId: true } },
  book: { select: { coverId: true } },
} as const;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const lists = await prisma.list.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: posterInclude } },
  });

  const flattened = lists.map((list) => ({
    ...list,
    items: list.items.map(({ movie, show, game, book, ...item }) => ({
      ...item,
      moviePosterPath: movie?.posterPath ?? show?.posterPath ?? game?.coverImageId ?? (book?.coverId ? String(book.coverId) : null),
    })),
  }));

  return NextResponse.json(flattened);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { name, type } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Give the list a name." }, { status: 400 });
  }

  const list = await prisma.list.create({
    data: { userId, name: name.trim(), type: type ?? "MIX" },
    include: { items: true },
  });

  return NextResponse.json(list);
}
