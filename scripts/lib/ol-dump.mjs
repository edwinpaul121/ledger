// Helpers for Open Library's monthly data dumps (https://openlibrary.org/developers/dumps).
// Dumps are the sanctioned way to get bulk data - the API asks not to be used for it.
const CONTACT = process.env.OPENLIBRARY_CONTACT ?? "unknown@example.com";
export const OL_HEADERS = { "User-Agent": `LedgerApp/1.0 (${CONTACT})` };
export const dumpUrl = (name) => `https://openlibrary.org/data/ol_dump_${name}_latest.txt.gz`;

const DATE = /(\d{4}-\d{2}-\d{2})/;

// Date of the current "latest" dump, read from where the latest link redirects
// (e.g. .../ol_dump_works_2026-09-01.txt.gz). Cheap: one HEAD request, no download.
export async function latestDumpDate() {
  const res = await fetch(dumpUrl("ratings"), { method: "HEAD", headers: OL_HEADERS });
  if (!res.ok) throw new Error(`Open Library dump check failed (${res.status})`);
  const fromUrl = res.url.match(DATE)?.[1];
  if (fromUrl) return fromUrl;
  const lm = res.headers.get("last-modified");
  if (lm) return new Date(lm).toISOString().slice(0, 10);
  throw new Error("Could not determine the dump date");
}

export const dateToInt = (d) => Number(d.replaceAll("-", "")); // 2026-09-01 -> 20260901
export const dateFromUrl = (url) => url.match(DATE)?.[1] ?? null;
