import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { recordView } from "@/lib/view-history";
import GameActions from "@/components/game/GameActions";
import GameDetailsGrid from "@/components/game/GameDetailsGrid";
import ScreenshotGallery from "@/components/game/ScreenshotGallery";
import ReviewSection from "@/components/movie/ReviewSection";

export default async function GameDetailPage({ params }: { params: { id: string } }) {
  const game = await prisma.game.findUnique({ where: { id: params.id } });
  if (!game) notFound();

  const userId = await getCurrentUserId();

  const myEntry = userId
    ? await prisma.entry.findUnique({
        where: { userId_gameId: { userId, gameId: game.id } },
      })
    : null;

  if (userId) {
    await recordView({
      userId,
      path: `/games/${game.id}`,
      title: game.name,
      kind: "game",
      gameId: game.id,
    });
  }

  const cover = game.coverImageId
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverImageId}.jpg`
    : null;
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : null;
  const screenshots = (game.screenshots as unknown as string[] | null) ?? [];

  return (
    <main>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-16 md:flex-row md:px-20">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={game.name}
            className="w-[200px] shrink-0 rounded-xl border border-ink-line shadow-2xl md:w-[240px]"
          />
        )}

        <div className="flex flex-1 flex-col gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-paper-dim">
            {year && <span>{year}</span>}
            {game.genres && <span>{game.genres}</span>}
          </div>

          <h1 className="font-display text-4xl text-paper md:text-5xl">{game.name}</h1>

          {game.rating !== null && (
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-md bg-panel px-2.5 py-1 font-semibold text-mint">
                {Math.round(game.rating)} / 100
              </span>
              {game.ratingCount !== null && (
                <span className="text-paper-faint">
                  {game.ratingCount.toLocaleString()} critic reviews on IGDB
                </span>
              )}
            </div>
          )}

          {game.summary && (
            <p className="max-w-2xl leading-relaxed text-paper-dim">{game.summary}</p>
          )}

          <GameActions
            gameId={game.id}
            gameTitle={game.name}
            signedIn={!!userId}
            initialFavorite={myEntry?.favorite ?? false}
            initialStatus={myEntry?.status ?? null}
            initialProgressLabel={myEntry?.progressLabel ?? null}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-24 pt-14 md:px-20">
        <GameDetailsGrid
          platforms={game.platforms}
          developer={game.developer}
          publisher={game.publisher}
          gameModes={game.gameModes}
          timeToBeatMainMinutes={game.timeToBeatMainMinutes}
          timeToBeatCompleteMinutes={game.timeToBeatCompleteMinutes}
        />

        <ScreenshotGallery imageIds={screenshots} />

        <ReviewSection />
      </div>
    </main>
  );
}
