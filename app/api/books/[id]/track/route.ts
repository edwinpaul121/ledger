import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });

  const { favorite, status, progressLabel } = await req.json();
  const now = new Date();
  const startingWatch = status === "IN_PROGRESS";
  const completingNow = status === "COMPLETED";

  try {
    const entry = await prisma.entry.upsert({
      where: { userId_bookId: { userId, bookId: book.id } },
      create: {
        userId,
        bookId: book.id,
        mediaType: "BOOK",
        title: book.title,
        status: status ?? null,
        favorite: favorite ?? false,
        ...(progressLabel !== undefined && { progressLabel }),
        ...(startingWatch && { startedAt: now }),
        ...(completingNow && { finishedAt: now }),
      },
      update: {
        ...(status !== undefined && { status }),
        ...(favorite !== undefined && { favorite }),
        ...(progressLabel !== undefined && { progressLabel }),
        ...(startingWatch && { startedAt: now }),
        ...(completingNow && { finishedAt: now }),
      },
    });
    return NextResponse.json({ ...entry, moviePosterPath: book.coverId ? String(book.coverId) : null });
  } catch (err) {
    console.error("Failed to upsert entry for book track:", err);
    return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
  }
}
