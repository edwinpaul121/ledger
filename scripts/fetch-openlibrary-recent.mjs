// Incremental books update: pulls only RECENT works from the Open Library
// search API (a handful of requests, identified by User-Agent) - not a bulk
// download. The initial/full import uses the monthly data dump instead
// (scripts/fetch-openlibrary-books.mjs). Run by the daily check, or manually:
//   npm run fetch:books:recent
import { PrismaClient } from "@prisma/client";
import { getRange } from "./lib/range.mjs";
import { OL_HEADERS } from "./lib/ol-dump.mjs";

const prisma = new PrismaClient();
const LIMIT = Number(process.env.OL_RECENT_LIMIT ?? 50);
const RANGE = getRange("books"); // the sync passes IMPORT_FROM_DATE / IMPORT_TO_DATE for its window
const FIELDS =
  "key,title,author_name,cover_i,first_publish_year,edition_count,ratings_average,ratings_count,subject";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`https://openlibrary.org${path}`, { headers: OL_HEADERS });
      if (res.ok) return await res.json();
      lastErr = new Error(`${res.status} ${res.statusText}`);
      if (res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastErr = err;
    }
    await sleep(1500 * (i + 1));
  }
  throw lastErr;
}

const textOf = (v) => (!v ? null : typeof v === "string" ? v : v.value ?? null);

async function main() {
  const q = encodeURIComponent(
    `first_publish_year:[${RANGE.fromYear} TO ${RANGE.toYear}] AND cover_i:[1 TO *]`
  );
  const data = await getJson(`/search.json?q=${q}&sort=new&limit=${LIMIT}&fields=${FIELDS}`);

  let added = 0;
  let skipped = 0;
  for (const d of data.docs ?? []) {
    const olid = d.key?.split("/").pop();
    if (!olid || !d.cover_i || !d.title) continue;

    // Already have it (e.g. from the dump)? Nothing to do - saves a request.
    if (await prisma.book.findUnique({ where: { olid }, select: { id: true } })) {
      skipped++;
      continue;
    }

    let description = null;
    try {
      description = textOf((await getJson(`/works/${olid}.json`, 2))?.description);
    } catch {}
    await sleep(400); // gentle: well under Open Library's 3 requests/second

    await prisma.book.create({
      data: {
        olid,
        title: d.title,
        authors: (d.author_name ?? []).slice(0, 3).join(", ") || null,
        description,
        coverId: d.cover_i,
        firstPublishYear: d.first_publish_year ?? null,
        subjects: (d.subject ?? []).slice(0, 8).join(", ") || null,
        rating: d.ratings_average ?? null,
        ratingCount: d.ratings_count ?? null,
        popularity: d.edition_count ?? null,
      },
    });
    added++;
  }
  console.log(`[books] recent update: ${added} new books added, ${skipped} already present`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
