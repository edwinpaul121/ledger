// Catalog automation.
//   node scripts/catalog-sync.mjs          daemon: first-run backfill, then a check every 24h
//   node scripts/catalog-sync.mjs --once   a single check (npm run sync:catalog)
//
// 0. Restore: if db-seed/catalog.json.gz exists, it is loaded first (fast, no API
//    calls). A fresh snapshot is saved again after anything new is fetched.
// 1. Backfill: any catalog table that is still empty is filled using the configured
//    year range (IMPORT_FROM_YEAR..IMPORT_TO_YEAR) and page counts.
// 2. Daily check: asks each source (cheaply) how many titles exist in the
//    recent window. Only if that number grew since the last check does it
//    run the importer for the window (without quality filters, since brand-new
//    titles have no votes yet). Otherwise it does nothing. Books: the first fill
//    comes from Open Library's monthly dump; the daily check then only looks up
//    newly added books through the API, and never re-imports the whole dump.
import { PrismaClient } from "@prisma/client";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { getRange } from "./lib/range.mjs";
import { OL_HEADERS } from "./lib/ol-dump.mjs";

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const ONCE = process.argv.includes("--once");
const INTERVAL_MS = Number(process.env.SYNC_INTERVAL_HOURS ?? 24) * 3600 * 1000;
const WINDOW_DAYS = Number(process.env.SYNC_WINDOW_DAYS ?? 30);
const SYNC_PAGES = String(process.env.SYNC_MAX_PAGES ?? 3);
const TMDB_KEY = process.env.TMDB_API_KEY;
const IGDB_ID = process.env.IGDB_CLIENT_ID;
const IGDB_SECRET = process.env.IGDB_CLIENT_SECRET;

const log = (...a) => console.log("[catalog]", ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (d) => d.toISOString().slice(0, 10);

function recentWindow() {
  const to = new Date();
  const from = new Date(Date.now() - WINDOW_DAYS * 86400 * 1000);
  return { from: iso(from), to: iso(to) };
}

// ---- cheap "how many exist remotely?" probes --------------------------------
async function tmdbCount(kind, dateParam, w) {
  const url = `https://api.themoviedb.org/3/discover/${kind}?include_adult=false&${dateParam}.gte=${w.from}&${dateParam}.lte=${w.to}&page=1&api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return (await res.json()).total_results;
}

let igdbToken = null;
async function igdbCount(w) {
  if (!igdbToken) {
    const t = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${IGDB_ID}&client_secret=${IGDB_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );
    if (!t.ok) throw new Error(`Twitch ${t.status}`);
    igdbToken = (await t.json()).access_token;
  }
  const fromTs = Math.floor(new Date(`${w.from}T00:00:00Z`).getTime() / 1000);
  const toTs = Math.floor(new Date(`${w.to}T23:59:59Z`).getTime() / 1000);
  const res = await fetch("https://api.igdb.com/v4/games/count", {
    method: "POST",
    headers: { "Client-ID": IGDB_ID, Authorization: `Bearer ${igdbToken}` },
    body: `where cover != null & first_release_date >= ${fromTs} & first_release_date <= ${toTs};`,
  });
  if (!res.ok) throw new Error(`IGDB ${res.status}`);
  return (await res.json()).count;
}

async function olCount(w) {
  const q = encodeURIComponent(
    `first_publish_year:[${w.from.slice(0, 4)} TO ${w.to.slice(0, 4)}] AND cover_i:[1 TO *]`
  );
  const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1&fields=key`, {
    headers: OL_HEADERS,
  });
  if (!res.ok) throw new Error(`Open Library ${res.status}`);
  return (await res.json()).numFound;
}

// ---- the four catalogs ------------------------------------------------------
const TYPES = [
  {
    key: "movies",
    script: "fetch-tmdb-movies.mjs",
    enabled: !!TMDB_KEY,
    why: "TMDB_API_KEY not set",
    local: () => prisma.movie.count(),
    remote: (w) => tmdbCount("movie", "primary_release_date", w),
    pagesEnv: "TMDB_PAGES",
  },
  {
    key: "shows",
    script: "fetch-tmdb-shows.mjs",
    enabled: !!TMDB_KEY,
    why: "TMDB_API_KEY not set",
    local: () => prisma.show.count(),
    remote: (w) => tmdbCount("tv", "first_air_date", w),
    pagesEnv: "TMDB_SHOW_PAGES",
  },
  {
    key: "games",
    script: "fetch-igdb-games.mjs",
    enabled: !!(IGDB_ID && IGDB_SECRET),
    why: "IGDB_CLIENT_ID / IGDB_CLIENT_SECRET not set",
    local: () => prisma.game.count(),
    remote: (w) => igdbCount(w),
    pagesEnv: "IGDB_PAGES",
  },
  {
    key: "books",
    script: "fetch-openlibrary-books.mjs",
    enabled: true,
    why: "",
    local: () => prisma.book.count(),
    // Books count as filled only once the dump import has finished and recorded its date,
    // so a few incrementally-added books can't mask a failed first import.
    needsInit: async () => !(await prisma.catalogMeta.findUnique({ where: { key: "books_dump_date" } })),
    // Initial fill = Open Library monthly dump (script above). Afterwards, only a
    // small API lookup for newly added books (dailyScript) - never the full dump again.
    dailyScript: "fetch-openlibrary-recent.mjs",
    remote: (w) => olCount(w),
    describe: (remote, w) => `${remote} works with covers published ${w.from.slice(0, 4)}–${w.to.slice(0, 4)}`,
    pagesEnv: null,
  },
];

function runScript(script, env = {}) {
  return new Promise((resolve) => {
    const child = spawn("node", [path.join(here, script)], {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("exit", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

const SNAPSHOT = path.resolve("db-seed", "catalog.json.gz");
const AUTO_SNAPSHOT = process.env.AUTO_SNAPSHOT !== "false";
let fetchedSomething = false;
const failedBackfill = new Set(); // types whose first fill failed this cycle: no daily update until it works

async function restoreSnapshot() {
  if (!fs.existsSync(SNAPSHOT)) return;
  let anyEmpty = false;
  for (const t of TYPES) if ((await t.local()) === 0) anyEmpty = true;
  if (!anyEmpty) return;
  log("catalog has empty tables - restoring db-seed/catalog.json.gz");
  await runScript("catalog-import.mjs");
}

async function saveSnapshot() {
  if (!AUTO_SNAPSHOT || !fetchedSomething) return;
  fetchedSomething = false;
  await runScript("catalog-export.mjs");
}

async function backfillEmpty() {
  failedBackfill.clear();
  for (const t of TYPES) {
    if (!t.enabled) {
      log(`${t.key}: skipped (${t.why})`);
      continue;
    }
    const initialised = t.needsInit
      ? !(await t.needsInit())
      : (await t.local()) > 0;
    if (initialised) continue;
    const r = getRange(t.key);
    log(`${t.key}: empty - backfilling ${r.fromYear} → ${r.toYear}`);
    const ok = await runScript(t.script);
    log(`${t.key}: backfill ${ok ? "finished" : "FAILED (will retry next cycle)"}`);
    if (ok) fetchedSomething = true;
    else failedBackfill.add(t.key);
  }
}

async function dailyCheck() {
  const w = recentWindow();
  for (const t of TYPES) {
    if (!t.enabled) continue;
    if (failedBackfill.has(t.key)) {
      log(`${t.key}: first fill failed - skipping the daily update until it succeeds`);
      continue;
    }
    try {
      const remote = await t.remote(w);
      const state = await prisma.syncState.findUnique({ where: { key: t.key } });

      if (state && remote <= state.remoteCount) {
        log(`${t.key}: no new entries (${t.describe ? t.describe(remote, w) : `${remote} in ${w.from} → ${w.to}`}) - nothing to fetch`);
        continue;
      }

      log(
        `${t.key}: ${t.describe ? t.describe(remote, w) : `${state ? `${state.remoteCount} → ${remote}` : `first check, ${remote}`} in window`} - fetching`
      );
      const ok = await runScript(t.dailyScript ?? t.script, {
        IMPORT_FROM_DATE: w.from,
        IMPORT_TO_DATE: w.to,
        IMPORT_RELAXED: "1", // no quality filters for brand-new releases
        ...(t.pagesEnv ? { [t.pagesEnv]: SYNC_PAGES } : {}),
      });
      if (ok) {
        fetchedSomething = true;
        await prisma.syncState.upsert({
          where: { key: t.key },
          create: { key: t.key, remoteCount: remote },
          update: { remoteCount: remote },
        });
      } else {
        log(`${t.key}: fetch failed - will retry next cycle`);
      }
    } catch (err) {
      log(`${t.key}: check failed (${err.message}) - will retry next cycle`);
    }
  }
}

async function waitForDatabase() {
  for (let i = 0; i < 60; i++) {
    try {
      await prisma.syncState.count(); // table exists once migrations have run
      return;
    } catch {
      await sleep(5000);
    }
  }
  throw new Error("Database/migrations not ready after 5 minutes");
}

async function cycle() {
  try {
    await restoreSnapshot();
    await backfillEmpty();
    await dailyCheck();
    await saveSnapshot();
  } catch (err) {
    log("cycle error:", err.message);
  }
}

async function main() {
  if (!ONCE && process.env.AUTO_CATALOG === "false") {
    log("AUTO_CATALOG=false - automation disabled");
    return;
  }
  await waitForDatabase();
  await cycle();
  if (ONCE) {
    await prisma.$disconnect();
    return;
  }
  log(`next check in ${INTERVAL_MS / 3600000}h`);
  setInterval(async () => {
    await cycle();
    log(`next check in ${INTERVAL_MS / 3600000}h`);
  }, INTERVAL_MS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
