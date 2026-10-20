// One-time TMDB TV import - run manually with `npm run fetch:shows`.
// Heavier than the movie import: each show needs one call per season on top
// of the details call, so this makes noticeably more requests overall.
import { PrismaClient } from "@prisma/client";
import { getRange, slices } from "./lib/range.mjs";
import { mapLimit, fetchJsonRetry } from "./lib/pool.mjs";

const prisma = new PrismaClient();
const API_KEY = process.env.TMDB_API_KEY;
const PAGES = Number(process.env.TMDB_SHOW_PAGES ?? 8); // pages PER DECADE; 20 shows per page
const MAX_SEASONS_PER_SHOW = Number(process.env.TMDB_MAX_SEASONS ?? 10);
const RANGE = getRange("shows");
const SLICES = slices(RANGE, 10);
const MIN_VOTES = RANGE.relaxed ? 0 : Number(process.env.TMDB_SHOW_MIN_VOTES ?? 50);
const SORT = RANGE.relaxed ? "popularity.desc" : "vote_count.desc";
// Parallel requests (TMDB allows roughly 40/s). Lower if you see rate-limit messages.
const CONCURRENCY = Number(process.env.TMDB_CONCURRENCY ?? 4);
// Titles already imported within this many days are skipped, so re-runs resume instead of starting over.
const REFRESH_DAYS = Number(process.env.TMDB_REFRESH_DAYS ?? 30);
const BASE = "https://api.themoviedb.org/3";
const CAST_LIMIT = 30;
const KEY_CREW_JOBS = [
  "Creator",
  "Executive Producer",
  "Writer",
  "Director",
  "Original Music Composer",
];

if (!API_KEY) {
  console.error(
    "Missing TMDB_API_KEY. Get a free one at https://www.themoviedb.org/settings/api and add it to .env"
  );
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdb(path) {
  const separator = path.includes("?") ? "&" : "?";
  return fetchJsonRetry(`${BASE}${path}${separator}api_key=${API_KEY}`, `TMDB ${path.split("?")[0]}`);
}

async function main() {
  console.log("Fetching TV genre list...");
  const genreData = await tmdb("/genre/tv/list");
  const genreMap = new Map(genreData.genres.map((g) => [g.id, g.name]));

  let showCount = 0;
  let skipped = 0;
  let episodeCount = 0;

  for (const slice of SLICES) {
  for (let page = 1; page <= PAGES; page++) {
    console.log(`Shows ${slice.fromYear}–${slice.toYear} — page ${page}/${PAGES}...`);
    const data = await tmdb(
      `/discover/tv?sort_by=${SORT}&include_adult=false&vote_count.gte=${MIN_VOTES}&first_air_date.gte=${slice.from}&first_air_date.lte=${slice.to}&page=${page}`
    );
    if (!data.results?.length) break;

    await mapLimit(data.results, CONCURRENCY, async (summary) => {
      if (!RANGE.relaxed && !summary.poster_path) return; // quality: needs a poster
      const existing = await prisma.show.findUnique({
        where: { tmdbId: summary.id },
        select: { updatedAt: true },
      });
      if (existing && Date.now() - existing.updatedAt.getTime() < REFRESH_DAYS * 86400000) {
        skipped++;
        return;
      }
      let details;
      try {
        details = await tmdb(`/tv/${summary.id}?append_to_response=credits`);
      } catch (err) {
        console.warn(`  Skipping "${summary.name}" - details fetch failed: ${err.message}`);
        return;
      }

      const genres = details.genres?.length
        ? details.genres.map((g) => g.name).join(", ")
        : (summary.genre_ids ?? []).map((id) => genreMap.get(id)).filter(Boolean).join(", ");

      const cast = (details.credits?.cast ?? []).slice(0, CAST_LIMIT).map((c) => ({
        name: c.name,
        character: c.character,
        profilePath: c.profile_path || null,
      }));
      const crew = (details.credits?.crew ?? [])
        .filter((c) => KEY_CREW_JOBS.includes(c.job))
        .map((c) => ({ name: c.name, job: c.job, profilePath: c.profile_path || null }));

      const show = await prisma.show.upsert({
        where: { tmdbId: details.id },
        create: {
          tmdbId: details.id,
          name: details.name,
          overview: details.overview || null,
          posterPath: details.poster_path || null,
          backdropPath: details.backdrop_path || null,
          firstAirDate: details.first_air_date ? new Date(details.first_air_date) : null,
          status: details.status || null,
          genres: genres || null,
          voteAverage: details.vote_average ?? null,
          voteCount: details.vote_count ?? null,
          popularity: details.popularity ?? null,
          numberOfSeasons: details.number_of_seasons ?? null,
          numberOfEpisodes: details.number_of_episodes ?? null,
          cast: cast.length ? cast : undefined,
          crew: crew.length ? crew : undefined,
        },
        update: {
          name: details.name,
          overview: details.overview || null,
          posterPath: details.poster_path || null,
          backdropPath: details.backdrop_path || null,
          firstAirDate: details.first_air_date ? new Date(details.first_air_date) : null,
          status: details.status || null,
          genres: genres || null,
          voteAverage: details.vote_average ?? null,
          voteCount: details.vote_count ?? null,
          popularity: details.popularity ?? null,
          numberOfSeasons: details.number_of_seasons ?? null,
          numberOfEpisodes: details.number_of_episodes ?? null,
          cast: cast.length ? cast : undefined,
          crew: crew.length ? crew : undefined,
        },
      });

      const realSeasons = (details.seasons ?? []).filter((s) => s.season_number > 0);
      const seasonsToFetch = realSeasons.slice(0, MAX_SEASONS_PER_SHOW);

      for (const seasonSummary of seasonsToFetch) {
        let seasonDetails;
        try {
          seasonDetails = await tmdb(
            `/tv/${details.id}/season/${seasonSummary.season_number}`
          );
        } catch (err) {
          console.warn(
            `    Skipping season ${seasonSummary.season_number} of "${details.name}": ${err.message}`
          );
          continue;
        }

        const season = await prisma.season.upsert({
          where: {
            showId_seasonNumber: { showId: show.id, seasonNumber: seasonSummary.season_number },
          },
          create: {
            showId: show.id,
            seasonNumber: seasonSummary.season_number,
            name: seasonSummary.name || null,
            overview: seasonSummary.overview || null,
            posterPath: seasonSummary.poster_path || null,
            episodeCount: seasonSummary.episode_count ?? null,
          },
          update: {
            name: seasonSummary.name || null,
            overview: seasonSummary.overview || null,
            posterPath: seasonSummary.poster_path || null,
            episodeCount: seasonSummary.episode_count ?? null,
          },
        });

        for (const ep of seasonDetails.episodes ?? []) {
          await prisma.episode.upsert({
            where: {
              seasonId_episodeNumber: { seasonId: season.id, episodeNumber: ep.episode_number },
            },
            create: {
              seasonId: season.id,
              showId: show.id,
              seasonNumber: seasonSummary.season_number,
              episodeNumber: ep.episode_number,
              name: ep.name || null,
              overview: ep.overview || null,
              airDate: ep.air_date ? new Date(ep.air_date) : null,
              stillPath: ep.still_path || null,
              runtime: ep.runtime ?? null,
            },
            update: {
              name: ep.name || null,
              overview: ep.overview || null,
              airDate: ep.air_date ? new Date(ep.air_date) : null,
              stillPath: ep.still_path || null,
              runtime: ep.runtime ?? null,
            },
          });
          episodeCount++;
        }

        await sleep(80);
      }

      showCount++;
    });

    if (page >= data.total_pages) break;
    await sleep(100);
  }
  }

  console.log(`Done — upserted ${showCount} shows and ${episodeCount} episodes (${skipped} shows already up to date, skipped).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
