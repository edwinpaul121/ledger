// One-time TMDB import - run manually with `npm run fetch:movies`.
// Not scheduled/automatic yet, per the plan to add daily refresh later.
import { PrismaClient } from "@prisma/client";
import { getRange, slices } from "./lib/range.mjs";
import { mapLimit, fetchJsonRetry } from "./lib/pool.mjs";

const prisma = new PrismaClient();
const API_KEY = process.env.TMDB_API_KEY;
const PAGES = Number(process.env.TMDB_PAGES ?? 15); // pages PER DECADE; 20 movies per page
const RANGE = getRange("movies");
const SLICES = slices(RANGE, 10);
// Quality filter: enough votes to be a real, recognised film. Skipped in relaxed (daily sync) mode.
const MIN_VOTES = RANGE.relaxed ? 0 : Number(process.env.TMDB_MIN_VOTES ?? 100);
const SORT = RANGE.relaxed ? "popularity.desc" : "vote_count.desc";
// Parallel requests (TMDB allows roughly 40/s). Lower if you see rate-limit messages.
const CONCURRENCY = Number(process.env.TMDB_CONCURRENCY ?? 10);
// Titles already imported within this many days are skipped, so re-runs resume instead of starting over.
const REFRESH_DAYS = Number(process.env.TMDB_REFRESH_DAYS ?? 30);
const BASE = "https://api.themoviedb.org/3";
const CAST_LIMIT = 30; // stored for the "full cast" view; the page shows top 10 by default
const KEY_CREW_JOBS = [
  "Director",
  "Writer",
  "Screenplay",
  "Story",
  "Producer",
  "Executive Producer",
  "Director of Photography",
  "Editor",
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
  console.log("Fetching genre list...");
  const genreData = await tmdb("/genre/movie/list");
  const genreMap = new Map(genreData.genres.map((g) => [g.id, g.name]));

  let count = 0;
  let skipped = 0;

  for (const slice of SLICES) {
  for (let page = 1; page <= PAGES; page++) {
    console.log(`Movies ${slice.fromYear}–${slice.toYear} — page ${page}/${PAGES}...`);
    const data = await tmdb(
      `/discover/movie?sort_by=${SORT}&include_adult=false&vote_count.gte=${MIN_VOTES}&primary_release_date.gte=${slice.from}&primary_release_date.lte=${slice.to}&page=${page}`
    );
    if (!data.results?.length) break;

    await mapLimit(data.results, CONCURRENCY, async (summary) => {
      if (!RANGE.relaxed && !summary.poster_path) return; // quality: needs a poster
      const existing = await prisma.movie.findUnique({
        where: { tmdbId: summary.id },
        select: { updatedAt: true },
      });
      if (existing && Date.now() - existing.updatedAt.getTime() < REFRESH_DAYS * 86400000) {
        skipped++;
        return;
      }
      // The popular-list endpoint is missing runtime, budget, cast, etc. -
      // pull the full details (with credits) for each movie individually.
      let details;
      try {
        details = await tmdb(`/movie/${summary.id}?append_to_response=credits`);
      } catch (err) {
        console.warn(`  Skipping "${summary.title}" - details fetch failed: ${err.message}`);
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

      const allCrew = details.credits?.crew ?? [];
      const crew = allCrew
        .filter((c) => KEY_CREW_JOBS.includes(c.job))
        .map((c) => ({ name: c.name, job: c.job, profilePath: c.profile_path || null }));

      const director = allCrew.find((c) => c.job === "Director")?.name || null;
      const writers = [
        ...new Set(
          allCrew
            .filter((c) => ["Writer", "Screenplay", "Story"].includes(c.job))
            .map((c) => c.name)
        ),
      ].join(", ") || null;

      const fields = {
        title: details.title,
        originalTitle: details.original_title || null,
        tagline: details.tagline || null,
        overview: details.overview || null,
        posterPath: details.poster_path || null,
        backdropPath: details.backdrop_path || null,
        releaseDate: details.release_date ? new Date(details.release_date) : null,
        runtime: details.runtime ?? null,
        status: details.status || null,
        originalLanguage: details.original_language || null,
        budget: details.budget || null,
        revenue: details.revenue || null,
        voteAverage: details.vote_average ?? null,
        voteCount: details.vote_count ?? null,
        popularity: details.popularity ?? null,
        genres: genres || null,
        productionCompanies:
          details.production_companies?.map((c) => c.name).join(", ") || null,
        spokenLanguages:
          details.spoken_languages?.map((l) => l.english_name).join(", ") || null,
        director,
        writers,
        cast: cast.length ? cast : undefined,
        crew: crew.length ? crew : undefined,
      };

      await prisma.movie.upsert({
        where: { tmdbId: details.id },
        create: { tmdbId: details.id, ...fields },
        update: fields,
      });
      count++;

    });

    if (page >= data.total_pages) break;
    await sleep(100);
  }
  }

  console.log(`Done — upserted ${count} movies (${skipped} already up to date, skipped).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
