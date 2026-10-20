import { prisma } from "@/lib/prisma";

export async function recordView({
  userId,
  path,
  title,
  kind,
  movieId,
  showId,
  gameId,
  bookId,
}: {
  userId: string;
  path: string;
  title: string;
  kind?: string;
  movieId?: string;
  showId?: string;
  gameId?: string;
  bookId?: string;
}) {
  try {
    await prisma.viewHistory.upsert({
      where: { userId_path: { userId, path } },
      create: { userId, path, title, kind, movieId, showId, gameId, bookId },
      update: { title, kind, movieId, showId, gameId, bookId },
    });
  } catch (err) {
    // View tracking should never break the page it's tracking.
    console.error("Failed to record view:", err);
  }
}
