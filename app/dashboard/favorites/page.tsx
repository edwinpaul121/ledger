import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import FavoritesGrid from "@/components/dashboard/FavoritesGrid";
import type { Entry } from "@/components/dashboard/types";

export default async function FavoritesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const entries = await prisma.entry.findMany({
    where: { userId, favorite: true },
    orderBy: { updatedAt: "desc" },
    include: {
      movie: { select: { posterPath: true } },
      show: { select: { posterPath: true } },
      game: { select: { coverImageId: true } },
      book: { select: { coverId: true } },
    },
  });

  const items: Entry[] = JSON.parse(
    JSON.stringify(
      entries.map(({ movie, show, game, book, ...entry }) => ({
        ...entry,
        moviePosterPath: movie?.posterPath ?? show?.posterPath ?? game?.coverImageId ?? (book?.coverId ? String(book.coverId) : null),
      }))
    )
  );

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-14 md:px-20">
      <Link href="/dashboard" className="text-sm text-paper-dim transition-colors hover:text-paper">
        ← Back to dashboard
      </Link>
      <h1 className="mb-8 mt-3 font-display text-4xl text-paper">Favorites</h1>
      <FavoritesGrid initialEntries={items} />
    </main>
  );
}
