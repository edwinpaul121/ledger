import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { recordView } from "@/lib/view-history";
import ShowActions from "@/components/show/ShowActions";
import SeasonList from "@/components/show/SeasonList";
import CastRow from "@/components/movie/CastRow";
import ReviewSection from "@/components/movie/ReviewSection";

type CastMember = { name: string; character: string; profilePath: string | null };
type CrewMember = { name: string; job: string; profilePath: string | null };

export default async function ShowDetailPage({ params }: { params: { id: string } }) {
  const show = await prisma.show.findUnique({
    where: { id: params.id },
    include: {
      seasons: {
        orderBy: { seasonNumber: "asc" },
        include: { episodes: { orderBy: { episodeNumber: "asc" } } },
      },
    },
  });
  if (!show) notFound();

  const userId = await getCurrentUserId();

  const myEntry = userId
    ? await prisma.entry.findUnique({
        where: { userId_showId: { userId, showId: show.id } },
      })
    : null;

  const watchedEpisodeIds = userId
    ? new Set(
        (
          await prisma.episodeProgress.findMany({
            where: {
              userId,
              episode: { showId: show.id },
            },
            select: { episodeId: true },
          })
        ).map((p) => p.episodeId)
      )
    : new Set<string>();

  if (userId) {
    await recordView({
      userId,
      path: `/shows/${show.id}`,
      title: show.name,
      kind: "show",
      showId: show.id,
    });
  }

  const poster = show.posterPath ? `https://image.tmdb.org/t/p/w500${show.posterPath}` : null;
  const backdrop = show.backdropPath
    ? `https://image.tmdb.org/t/p/original${show.backdropPath}`
    : null;
  const year = show.firstAirDate ? new Date(show.firstAirDate).getFullYear() : null;
  const cast = (show.cast as unknown as CastMember[] | null) ?? [];
  const crew = (show.crew as unknown as CrewMember[] | null) ?? [];

  const seasonsForUi = show.seasons.map((season) => ({
    id: season.id,
    seasonNumber: season.seasonNumber,
    name: season.name,
    posterPath: season.posterPath,
    episodes: season.episodes.map((ep) => ({
      id: ep.id,
      episodeNumber: ep.episodeNumber,
      name: ep.name,
      airDate: ep.airDate ? ep.airDate.toISOString() : null,
      stillPath: ep.stillPath,
      watched: watchedEpisodeIds.has(ep.id),
    })),
  }));

  return (
    <main className="relative">
      {backdrop && (
        <div className="absolute inset-x-0 top-0 h-[760px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backdrop} alt="" className="size-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-20 md:flex-row md:px-20 md:pt-28">
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={show.name}
            className="w-[200px] shrink-0 rounded-xl border border-ink-line shadow-2xl md:w-[240px]"
          />
        )}

        <div className="flex flex-1 flex-col gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-paper-dim">
            {year && <span>{year}</span>}
            {show.genres && <span>{show.genres}</span>}
            {show.numberOfSeasons && (
              <span>
                {show.numberOfSeasons} season{show.numberOfSeasons === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl text-paper md:text-5xl">{show.name}</h1>

          {myEntry?.progressLabel && (
            <p className="text-sm font-semibold text-mint">{myEntry.progressLabel}</p>
          )}

          {show.voteAverage !== null && (
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-md bg-panel px-2.5 py-1 font-semibold text-mint">
                {show.voteAverage?.toFixed(1)} / 10
              </span>
              {show.voteCount !== null && (
                <span className="text-paper-faint">
                  {show.voteCount.toLocaleString()} votes on TMDB
                </span>
              )}
            </div>
          )}

          {show.overview && (
            <p className="max-w-2xl leading-relaxed text-paper-dim">{show.overview}</p>
          )}

          <ShowActions
            showId={show.id}
            showTitle={show.name}
            signedIn={!!userId}
            initialFavorite={myEntry?.favorite ?? false}
            initialOnWatchlist={myEntry?.status === "PLANNED"}
          />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-24 pt-14 md:px-20">
        <CastRow cast={cast} crew={crew} />

        <SeasonList seasons={seasonsForUi} signedIn={!!userId} />

        <ReviewSection />
      </div>
    </main>
  );
}
