import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { recordView } from "@/lib/view-history";
import { reconcileWatchedEntries } from "@/lib/reconcile-progress";
import MovieActions from "@/components/movie/MovieActions";
import MovieDetailsGrid from "@/components/movie/MovieDetailsGrid";
import CastRow from "@/components/movie/CastRow";
import ReviewSection from "@/components/movie/ReviewSection";

type CastMember = { name: string; character: string; profilePath: string | null };
type CrewMember = { name: string; job: string; profilePath: string | null };

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const movie = await prisma.movie.findUnique({ where: { id: params.id } });
  if (!movie) notFound();

  const userId = await getCurrentUserId();
  if (userId) await reconcileWatchedEntries(userId);

  const myEntry = userId
    ? await prisma.entry.findUnique({
        where: { userId_movieId: { userId, movieId: movie.id } },
      })
    : null;

  if (userId) {
    await recordView({
      userId,
      path: `/movies/${movie.id}`,
      title: movie.title,
      kind: "movie",
      movieId: movie.id,
    });
  }

  const poster = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : null;
  const backdrop = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const cast = (movie.cast as unknown as CastMember[] | null) ?? [];
  const crew = (movie.crew as unknown as CrewMember[] | null) ?? [];

  return (
    <main className="relative">
      {/* Backdrop as a fixed background for the hero + overview area, fading to the
          solid page background before the details/cast/reviews sections. */}
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
            alt={movie.title}
            className="w-[200px] shrink-0 rounded-xl border border-ink-line shadow-2xl md:w-[240px]"
          />
        )}

        <div className="flex flex-1 flex-col gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-paper-dim">
            {year && <span>{year}</span>}
            {movie.genres && <span>{movie.genres}</span>}
          </div>

          <h1 className="font-display text-4xl text-paper md:text-5xl">{movie.title}</h1>
          {movie.tagline && <p className="italic text-paper-dim">{movie.tagline}</p>}

          {(movie.director || movie.writers) && (
            <p className="text-sm text-paper-dim">
              {movie.director && (
                <>
                  Directed by <span className="text-paper">{movie.director}</span>
                </>
              )}
              {movie.director && movie.writers && "  ·  "}
              {movie.writers && (
                <>
                  Written by <span className="text-paper">{movie.writers}</span>
                </>
              )}
            </p>
          )}

          {movie.voteAverage !== null && (
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-md bg-panel px-2.5 py-1 font-semibold text-mint">
                {movie.voteAverage?.toFixed(1)} / 10
              </span>
              {movie.voteCount !== null && (
                <span className="text-paper-faint">
                  {movie.voteCount.toLocaleString()} votes on TMDB
                </span>
              )}
            </div>
          )}

          {movie.overview && (
            <p className="max-w-2xl leading-relaxed text-paper-dim">{movie.overview}</p>
          )}

          <MovieActions
            movieId={movie.id}
            movieTitle={movie.title}
            signedIn={!!userId}
            initialFavorite={myEntry?.favorite ?? false}
            initialStatus={myEntry?.status ?? null}
            initialStartedAt={myEntry?.startedAt ? myEntry.startedAt.toISOString() : null}
            runtimeMinutes={movie.runtime}
          />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-24 pt-14 md:px-20">
        <MovieDetailsGrid
          originalTitle={movie.originalTitle !== movie.title ? movie.originalTitle : null}
          status={movie.status}
          originalLanguage={movie.originalLanguage}
          runtime={movie.runtime}
          budget={movie.budget}
          revenue={movie.revenue}
          productionCompanies={movie.productionCompanies}
          spokenLanguages={movie.spokenLanguages}
        />

        <CastRow cast={cast} crew={crew} />

        <ReviewSection />
      </div>
    </main>
  );
}
