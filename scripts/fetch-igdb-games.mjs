// One-time IGDB import - run manually with `npm run fetch:games`.
// IGDB auth goes through Twitch: register a Twitch Developer app to get a
// client ID/secret, which this script trades for a short-lived app access
// token before querying IGDB itself.
import { PrismaClient } from "@prisma/client";
import { getRange, slices } from "./lib/range.mjs";

const prisma = new PrismaClient();
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const PAGES = Number(process.env.IGDB_PAGES ?? 6); // pages PER DECADE
const RANGE = getRange("games");
const SLICES = slices(RANGE, 10);
// Quality filter: a cover and at least a few user/critic ratings. Skipped in relaxed (daily sync) mode.
const MIN_RATINGS = RANGE.relaxed ? 0 : Number(process.env.IGDB_MIN_RATINGS ?? 5);
const SORT = RANGE.relaxed ? "popularity" : "total_rating_count";
const PAGE_SIZE = 50; // IGDB allows up to 500 per request

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing IGDB_CLIENT_ID / IGDB_CLIENT_SECRET. Register a Twitch Developer app at " +
      "https://dev.twitch.tv/console/apps to get these, then add them to .env"
  );
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAccessToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Twitch token request failed (${res.status})`);
  }
  const data = await res.json();
  return data.access_token;
}

async function igdb(token, endpoint, body) {
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`IGDB request failed (${res.status}) on ${endpoint}: ${await res.text()}`);
  }
  return res.json();
}

function joinNames(arr) {
  return arr?.length ? arr.map((x) => x.name).join(", ") || null : null;
}

function secondsToMinutes(seconds) {
  return seconds ? Math.round(seconds / 60) : null;
}

async function main() {
  console.log("Authenticating with Twitch...");
  const token = await getAccessToken();

  let count = 0;

  for (const slice of SLICES) {
  for (let page = 0; page < PAGES; page++) {
    console.log(`Games ${slice.fromYear}–${slice.toYear} — page ${page + 1}/${PAGES}...`);

    const games = await igdb(
      token,
      "games",
      `fields name,summary,storyline,first_release_date,genres.name,platforms.name,
        involved_companies.company.name,involved_companies.developer,involved_companies.publisher,
        cover.image_id,screenshots.image_id,aggregated_rating,aggregated_rating_count,
        game_modes.name,popularity;
       sort ${SORT} desc;
       where cover != null & total_rating_count >= ${MIN_RATINGS} & first_release_date >= ${slice.fromTs} & first_release_date <= ${slice.toTs};
       limit ${PAGE_SIZE};
       offset ${page * PAGE_SIZE};`
    );

    if (games.length === 0) break;

    // Batched time-to-beat lookup for this page, rather than one call per game.
    const ids = games.map((g) => g.id);
    let timeToBeats = [];
    try {
      timeToBeats = await igdb(
        token,
        "game_time_to_beats",
        `fields game_id,normally,completely; where game_id = (${ids.join(",")}); limit 500;`
      );
    } catch (err) {
      console.warn(`  Time-to-beat lookup failed for this page: ${err.message}`);
    }
    const timeToBeatMap = new Map(timeToBeats.map((t) => [t.game_id, t]));

    for (const g of games) {
      const developer =
        g.involved_companies?.find((c) => c.developer)?.company?.name || null;
      const publisher =
        g.involved_companies?.find((c) => c.publisher)?.company?.name || null;
      const ttb = timeToBeatMap.get(g.id);

      const fields = {
        name: g.name,
        summary: g.summary || null,
        storyline: g.storyline || null,
        coverImageId: g.cover?.image_id || null,
        screenshots: g.screenshots?.length
          ? g.screenshots.slice(0, 6).map((s) => s.image_id)
          : undefined,
        releaseDate: g.first_release_date ? new Date(g.first_release_date * 1000) : null,
        genres: joinNames(g.genres),
        platforms: joinNames(g.platforms),
        gameModes: joinNames(g.game_modes),
        developer,
        publisher,
        rating: g.aggregated_rating ?? null,
        ratingCount: g.aggregated_rating_count ?? null,
        popularity: g.popularity ?? null,
        timeToBeatMainMinutes: secondsToMinutes(ttb?.normally),
        timeToBeatCompleteMinutes: secondsToMinutes(ttb?.completely),
      };

      await prisma.game.upsert({
        where: { igdbId: g.id },
        create: { igdbId: g.id, ...fields },
        update: fields,
      });
      count++;
    }

    await sleep(250);
  }
  }

  console.log(`Done — upserted ${count} games.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
