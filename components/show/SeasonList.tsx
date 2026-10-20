"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

type EpisodeData = {
  id: string;
  episodeNumber: number;
  name: string | null;
  airDate: string | null;
  stillPath: string | null;
  watched: boolean;
};

type SeasonData = {
  id: string;
  seasonNumber: number;
  name: string | null;
  posterPath: string | null;
  episodes: EpisodeData[];
};

export default function SeasonList({
  seasons,
  signedIn,
}: {
  seasons: SeasonData[];
  signedIn: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState(seasons);
  const [expanded, setExpanded] = useState<string | null>(seasons[0]?.id ?? null);

  function requireSignIn() {
    window.location.href = "/login";
  }

  async function toggleEpisode(seasonId: string, episodeId: string, watched: boolean) {
    if (!signedIn) return requireSignIn();

    setData((prev) =>
      prev.map((s) =>
        s.id !== seasonId
          ? s
          : { ...s, episodes: s.episodes.map((e) => (e.id === episodeId ? { ...e, watched } : e)) }
      )
    );

    const res = await fetch(`/api/episodes/${episodeId}/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched }),
    });

    if (!res.ok) {
      setData((prev) =>
        prev.map((s) =>
          s.id !== seasonId
            ? s
            : {
                ...s,
                episodes: s.episodes.map((e) => (e.id === episodeId ? { ...e, watched: !watched } : e)),
              }
        )
      );
      console.error("Failed to save episode progress.");
      return;
    }

    router.refresh();
  }

  async function toggleSeason(seasonId: string, watched: boolean) {
    if (!signedIn) return requireSignIn();

    setData((prev) =>
      prev.map((s) =>
        s.id !== seasonId ? s : { ...s, episodes: s.episodes.map((e) => ({ ...e, watched })) }
      )
    );

    const res = await fetch(`/api/seasons/${seasonId}/watch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched }),
    });

    if (!res.ok) {
      console.error("Failed to save season progress.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4 border-t border-ink-line pt-10">
      <h2 className="font-display text-2xl text-paper">Seasons</h2>

      <div className="flex flex-col gap-3">
        {data.map((season) => {
          const watchedCount = season.episodes.filter((e) => e.watched).length;
          const allWatched = watchedCount === season.episodes.length && season.episodes.length > 0;
          const isOpen = expanded === season.id;

          return (
            <div key={season.id} className="rounded-xl border border-ink-line bg-ink-soft">
              <div className="flex items-center gap-4 p-4">
                {season.posterPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w185${season.posterPath}`}
                    alt=""
                    className="h-16 w-11 shrink-0 rounded-md border border-ink-line object-cover"
                  />
                ) : (
                  <span className="h-16 w-11 shrink-0 rounded-md bg-ink" />
                )}

                <button
                  onClick={() => setExpanded(isOpen ? null : season.id)}
                  className="flex flex-1 items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="font-semibold text-paper">
                      {season.name || `Season ${season.seasonNumber}`}
                    </p>
                    <p className="text-xs text-paper-faint">
                      {watchedCount}/{season.episodes.length} watched
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="size-4 text-paper-faint" />
                  ) : (
                    <ChevronDown className="size-4 text-paper-faint" />
                  )}
                </button>

                <button
                  onClick={() => toggleSeason(season.id, !allWatched)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    allWatched
                      ? "border-mint bg-mint/10 text-mint"
                      : "border-ink-line text-paper hover:border-mint hover:text-mint"
                  }`}
                >
                  {allWatched && <Check className="size-3.5" />}
                  {allWatched ? "Season watched" : "Mark season watched"}
                </button>
              </div>

              {isOpen && (
                <div className="flex flex-col gap-2 border-t border-ink-line p-4">
                  {season.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="flex items-center gap-3 rounded-lg border border-ink-line bg-ink px-3 py-2.5"
                    >
                      {ep.stillPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.tmdb.org/t/p/w185${ep.stillPath}`}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span className="h-10 w-16 shrink-0 rounded bg-ink-soft" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-paper">
                          E{ep.episodeNumber}
                          {ep.name ? ` · ${ep.name}` : ""}
                        </p>
                        {ep.airDate && (
                          <p className="text-xs text-paper-faint">
                            {new Date(ep.airDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleEpisode(season.id, ep.id, !ep.watched)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          ep.watched
                            ? "border-mint bg-mint/10 text-mint"
                            : "border-ink-line text-paper-dim hover:border-mint hover:text-mint"
                        }`}
                      >
                        {ep.watched && <Check className="size-3.5" />}
                        {ep.watched ? "Watched" : "Mark watched"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
