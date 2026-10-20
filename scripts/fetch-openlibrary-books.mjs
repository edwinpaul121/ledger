// Books import from Open Library's monthly DATA DUMPS - run manually with
// `npm run fetch:books`, or let scripts/catalog-sync.mjs run it.
//
// Why dumps: Open Library asks that bulk metadata not be pulled through its
// API, and publishes monthly dumps for exactly this. Files are streamed
// straight from the network (nothing big is written to disk):
//   reading-log (65 MB)  -> how many readers shelved each work  (popularity)
//   ratings     (5 MB)   -> average rating + count per work
//   works       (2.9 GB) -> title, description, subjects, cover, first-publish date
//   authors     (0.5 GB) -> author names
// The dump date is recorded in the catalog_meta table (key "books_dump_date")
// and shown on the Books and Credits pages.
//
// Tunables (.env): OL_MAX_BOOKS (5000), OL_MIN_READS (10), IMPORT_FROM_YEAR_BOOKS (1800).
import { PrismaClient } from "@prisma/client";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { getRange } from "./lib/range.mjs";
import { OL_HEADERS, dumpUrl, dateFromUrl } from "./lib/ol-dump.mjs";
import { openResilient } from "./lib/resilient-stream.mjs";

const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_BOOKS = Number(process.env.OL_MAX_BOOKS ?? 5000);
const MIN_READS = Number(process.env.OL_MIN_READS ?? 10);
const RANGE = getRange("books");

// Dump files you downloaded yourself take priority over downloading:
// put them in db-seed/openlibrary/ (keep the .gz, e.g. ol_dump_works_2026-09-01.txt.gz).
function findLocal(name) {
  const dir = path.resolve("db-seed", "openlibrary");
  if (!fs.existsSync(dir)) return null;
  const re = new RegExp(`^ol_dump_${name}_.*\\.txt\\.gz$`);
  const files = fs.readdirSync(dir).filter((f) => re.test(f)).sort();
  return files.length ? path.join(dir, files[files.length - 1]) : null;
}

function openLocal(file) {
  const total = fs.statSync(file).size;
  const state = { bytes: 0 };
  const stream = fs.createReadStream(file);
  stream.on("data", (c) => (state.bytes += c.length));
  return { stream, finalUrl: file, total, state };
}

// Streams a dump line by line. `onLine` may return true to stop early.
// Returns the final URL (it contains the dump's date).
async function streamDump(name, onLine) {
  const local = findLocal(name);
  if (local) console.log(`[books]   ${name}: using local file ${path.basename(local)}`);
  const { stream, finalUrl, total, state } = local
    ? openLocal(local)
    : await openResilient(dumpUrl(name), OL_HEADERS, name);
  const gunzip = zlib.createGunzip();
  stream.on("error", (e) => gunzip.destroy(e));

  // Progress + stall detection (a silent hang looks exactly like "still working").
  const started = Date.now();
  let lastBytes = 0;
  let lastChange = Date.now();
  const watchdog = setInterval(() => {
    if (state.bytes !== lastBytes) {
      lastBytes = state.bytes;
      lastChange = Date.now();
    }
    const mb = (state.bytes / 1048576).toFixed(0);
    const pct = total ? ` (${Math.round((state.bytes / total) * 100)}%)` : "";
    console.log(`[books]   ${name}: ${mb} MB downloaded${pct}, ${Math.round((Date.now() - started) / 1000)}s`);
    if (Date.now() - lastChange > 180000) {
      gunzip.destroy(new Error(`${name} download stalled for 3 minutes`));
    }
  }, 30000);

  const rl = readline.createInterface({ input: stream.pipe(gunzip), crlfDelay: Infinity });
  let lines = 0;
  try {
    for await (const line of rl) {
      lines++;
      if (onLine(line, lines) === true) break;
    }
  } finally {
    clearInterval(watchdog);
    rl.close();
    stream.destroy();
    gunzip.destroy();
  }
  console.log(`[books]   ${name}: finished, ${lines.toLocaleString()} lines`);
  return finalUrl;
}

const workKey = (k) => k?.replace("/works/", "");

// First year found in a free-form date like "1998", "June 1, 1998", "1998-06-01".
function yearOf(str) {
  const m = typeof str === "string" ? str.match(/\b(1[0-9]{3}|20[0-9]{2})\b/) : null;
  return m ? Number(m[1]) : null;
}

function textOf(v) {
  if (!v) return null;
  return typeof v === "string" ? v : v.value ?? null;
}

async function main() {
  // 1) Popularity: reading-log entries per work (tab-separated: work, edition, shelf, date)
  console.log("[books] reading-log dump...");
  const reads = new Map();
  await streamDump("reading-log", (line) => {
    const key = workKey(line.split("\t", 1)[0]);
    if (key) reads.set(key, (reads.get(key) ?? 0) + 1);
  });

  // 2) Ratings (tab-separated: work, edition, rating, date)
  console.log("[books] ratings dump...");
  const ratings = new Map();
  await streamDump("ratings", (line) => {
    const [w, , r] = line.split("\t");
    const key = workKey(w);
    const val = Number(r);
    if (!key || !val) return;
    const cur = ratings.get(key) ?? { sum: 0, n: 0 };
    cur.sum += val;
    cur.n += 1;
    ratings.set(key, cur);
  });

  // 3) Candidates: most-shelved works. Over-select so cover/year filters can drop some.
  const candidates = new Map(
    [...reads.entries()]
      .filter(([, n]) => n >= MIN_READS)
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.ceil(MAX_BOOKS * 1.6))
  );
  reads.clear();
  console.log(`[books] ${candidates.size} candidate works (>= ${MIN_READS} readers)`);
  if (candidates.size === 0) throw new Error("No candidate works found - dump format may have changed");

  // 4) Works dump: parse JSON only for candidate keys (everything else is skipped cheaply).
  console.log("[books] works dump (large - a few minutes)...");
  const found = new Map();
  const worksUrl = await streamDump("works", (line) => {
    const t1 = line.indexOf("\t");
    const t2 = line.indexOf("\t", t1 + 1);
    const key = workKey(line.slice(t1 + 1, t2));
    if (!candidates.has(key)) return;
    const jsonStart = line.indexOf("\t", line.indexOf("\t", t2 + 1) + 1) + 1;
    let w;
    try {
      w = JSON.parse(line.slice(jsonStart));
    } catch {
      return;
    }
    const cover = (w.covers ?? []).find((c) => c > 0);
    const year = yearOf(w.first_publish_date);
    if (!w.title || !cover) return; // quality: needs a cover
    if (year && (year < RANGE.fromYear || year > RANGE.toYear)) return;
    found.set(key, { w, cover, year });
    return found.size >= candidates.size; // everything found - stop early
  });
  const dumpDate = dateFromUrl(worksUrl) ?? new Date().toISOString().slice(0, 10);

  // Final pick: by popularity, capped.
  const picked = [...found.entries()]
    .sort((a, b) => (candidates.get(b[0]) ?? 0) - (candidates.get(a[0]) ?? 0))
    .slice(0, MAX_BOOKS);
  console.log(`[books] ${picked.length} books pass the filters`);

  // 5a) Save the books right away (authors filled in next), so they show up in the app
  //     before the last, slower step finishes.
  const dataFor = (key, { w, cover, year }, authors) => {
    const r = ratings.get(key);
    return {
      title: w.title,
      authors,
      description: textOf(w.description),
      coverId: cover,
      firstPublishYear: year,
      subjects: (w.subjects ?? []).slice(0, 8).join(", ") || null,
      rating: r ? Math.round((r.sum / r.n) * 100) / 100 : null,
      ratingCount: r ? r.n : null,
      popularity: candidates.get(key) ?? null,
    };
  };
  let saved = 0;
  for (const [key, entry] of picked) {
    const existing = await prisma.book.findUnique({ where: { olid: key }, select: { authors: true } });
    const data = dataFor(key, entry, existing?.authors ?? null);
    await prisma.book.upsert({ where: { olid: key }, create: { olid: key, ...data }, update: data });
    saved++;
  }
  await prisma.catalogMeta.upsert({
    where: { key: "books_dump_date" },
    create: { key: "books_dump_date", value: dumpDate },
    update: { value: dumpDate },
  });
  console.log(`[books] ${saved} books saved - adding author names...`);

  // 5b) Author names, only for the authors we need.
  const authorKeys = new Set();
  for (const [, { w }] of picked) {
    for (const a of (w.authors ?? []).slice(0, 3)) {
      if (a?.author?.key) authorKeys.add(a.author.key);
    }
  }
  console.log(`[books] authors dump (${authorKeys.size} needed)...`);
  const authorNames = new Map();
  await streamDump("authors", (line) => {
    const t1 = line.indexOf("\t");
    const t2 = line.indexOf("\t", t1 + 1);
    const key = line.slice(t1 + 1, t2);
    if (!authorKeys.has(key)) return;
    const jsonStart = line.indexOf("\t", line.indexOf("\t", t2 + 1) + 1) + 1;
    try {
      const a = JSON.parse(line.slice(jsonStart));
      if (a.name) authorNames.set(key, a.name);
    } catch {}
    return authorNames.size >= authorKeys.size;
  });

  // 6) Attach author names.
  for (const [key, { w }] of picked) {
    const names = (w.authors ?? [])
      .slice(0, 3)
      .map((a) => authorNames.get(a?.author?.key))
      .filter(Boolean)
      .join(", ");
    if (names) await prisma.book.update({ where: { olid: key }, data: { authors: names } });
  }

  await prisma.catalogMeta.upsert({
    where: { key: "books_dump_source" },
    create: { key: "books_dump_source", value: "https://openlibrary.org/developers/dumps" },
    update: { value: "https://openlibrary.org/developers/dumps" },
  });
  console.log(`[books] done: ${saved} books saved from the Open Library dump dated ${dumpDate}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
