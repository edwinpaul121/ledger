import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import ListDetailView from "@/components/dashboard/ListDetailView";
import type { ListItem } from "@/components/dashboard/types";

export default async function ListPage({ params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/");

  const list = await prisma.list.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          movie: { select: { posterPath: true } },
          show: { select: { posterPath: true } },
          game: { select: { coverImageId: true } },
          book: { select: { coverId: true } },
        },
      },
    },
  });

  if (!list || list.userId !== userId) notFound();

  const items: ListItem[] = JSON.parse(
    JSON.stringify(
      list.items.map(({ movie, show, game, book, ...item }) => ({
        ...item,
        moviePosterPath: movie?.posterPath ?? show?.posterPath ?? game?.coverImageId ?? (book?.coverId ? String(book.coverId) : null),
      }))
    )
  );

  return (
    <main className="mx-auto max-w-[900px] px-6 py-14 md:px-20">
      <Link href="/dashboard" className="text-sm text-paper-dim transition-colors hover:text-paper">
        ← Back to dashboard
      </Link>
      <h1 className="mb-1 mt-3 font-display text-4xl text-paper">{list.name}</h1>
      <p className="mb-8 text-sm text-paper-faint">
        {list.type === "MIX" ? "Mixed" : list.type} · {items.length} items
      </p>
      <ListDetailView items={items} />
    </main>
  );
}
