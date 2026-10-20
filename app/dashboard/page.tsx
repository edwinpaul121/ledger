import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { reconcileWatchedEntries } from "@/lib/reconcile-progress";
import DashboardBoard from "@/components/dashboard/DashboardBoard";

const posterSelect = {
  movie: { select: { posterPath: true } },
  show: { select: { posterPath: true } },
  game: { select: { coverImageId: true } },
  book: { select: { coverId: true } },
} as const;

function flattenPoster<
  T extends {
    movie?: { posterPath: string | null } | null;
    show?: { posterPath: string | null } | null;
    game?: { coverImageId: string | null } | null;
    book?: { coverId: number | null } | null;
  }
>(row: T) {
  const { movie, show, game, book, ...rest } = row;
  return {
    ...rest,
    moviePosterPath: movie?.posterPath ?? show?.posterPath ?? game?.coverImageId ?? (book?.coverId ? String(book.coverId) : null),
  };
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  await reconcileWatchedEntries(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      entries: {
        orderBy: { updatedAt: "desc" },
        include: posterSelect,
      },
      lists: {
        include: { items: { include: posterSelect } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) redirect("/");

  const viewHistory = await prisma.viewHistory.findMany({
    where: { userId },
    orderBy: { viewedAt: "desc" },
    take: 10,
    include: posterSelect,
  });

  const entries = user.entries.map(flattenPoster);
  const lists = user.lists.map((list) => ({ ...list, items: list.items.map(flattenPoster) }));
  const views = viewHistory.map(flattenPoster);

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 md:px-20">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-paper">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-2 text-paper-dim">Here's everything you're keeping up with.</p>
      </div>

      <DashboardBoard
        initialEntries={JSON.parse(JSON.stringify(entries))}
        initialLists={JSON.parse(JSON.stringify(lists))}
        initialViewHistory={JSON.parse(JSON.stringify(views))}
      />
    </main>
  );
}
