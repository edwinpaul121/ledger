import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const list = await prisma.list.findUnique({ where: { id: params.id } });
  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { title, mediaType, movieId, showId, gameId, bookId } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Give the item a title." }, { status: 400 });
  }

  if (list.type !== "MIX" && mediaType && mediaType !== list.type) {
    return NextResponse.json(
      { error: `This list only accepts ${list.type.toLowerCase()}s.` },
      { status: 400 }
    );
  }

  const item = await prisma.listItem.create({
    data: {
      listId: params.id,
      title: title.trim(),
      mediaType: mediaType || null,
      movieId: movieId || null,
      showId: showId || null,
      gameId: gameId || null,
      bookId: bookId || null,
    },
    include: {
      movie: { select: { posterPath: true } },
      show: { select: { posterPath: true } },
      game: { select: { coverImageId: true } },
      book: { select: { coverId: true } },
    },
  });

  const { movie, show, game, book, ...rest } = item;
  return NextResponse.json({
    ...rest,
    moviePosterPath: movie?.posterPath ?? show?.posterPath ?? game?.coverImageId ?? (book?.coverId ? String(book.coverId) : null),
  });
}
