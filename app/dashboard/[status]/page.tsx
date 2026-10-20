import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { reconcileWatchedEntries } from "@/lib/reconcile-progress";
import EntryListItem from "@/components/dashboard/EntryListItem";
import type { Entry } from "@/components/dashboard/types";

const STATUS_MAP: Record<string, { status: "PLANNED" | "IN_PROGRESS" | "COMPLETED"; label: string }> = {
  backlog: { status: "PLANNED", label: "Backlog" },
  tracking: { status: "IN_PROGRESS", label: "Currently Tracking" },
  completed: { status: "COMPLETED", label: "Completed" },
};

export default async function DashboardStatusPage({ params }: { params: { status: string } }) {
  const meta = STATUS_MAP[params.status];
  if (!meta) notFound();

  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  await reconcileWatchedEntries(userId);

  const entries = await prisma.entry.findMany({
    where: { userId, status: meta.status },
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
    <main className="mx-auto max-w-[900px] px-6 py-14 md:px-20">
      <Link href="/dashboard" className="text-sm text-paper-dim transition-colors hover:text-paper">
        ← Back to dashboard
      </Link>
      <h1 className="mb-8 mt-3 font-display text-4xl text-paper">{meta.label}</h1>

      {items.length === 0 ? (
        <p className="text-sm text-paper-faint">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((entry) => (
            <EntryListItem key={entry.id} entry={entry} meta={entry.progressLabel ?? undefined} />
          ))}
        </div>
      )}
    </main>
  );
}
