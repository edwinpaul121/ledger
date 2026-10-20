// Saves the catalog (movies, shows, seasons, episodes, games, books) to
// db-seed/catalog.json.gz so it can be restored later without re-fetching
// from the APIs. User data (accounts, lists, entries) is NOT included.
//   npm run catalog:export            (add --force to overwrite with a smaller snapshot)
import { PrismaClient } from "@prisma/client";
import { gzipSync, gunzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";

export const SEED_FILE = path.resolve("db-seed", "catalog.json.gz");

// Parent tables first so a restore never violates a foreign key.
export const TABLES = ["movie", "show", "season", "episode", "game", "book", "catalogMeta"];

const prisma = new PrismaClient();
const force = process.argv.includes("--force");

async function main() {
  const data = {};
  let total = 0;
  for (const t of TABLES) {
    data[t] = await prisma[t].findMany();
    total += data[t].length;
  }

  if (total === 0) {
    console.log("[export] catalog is empty - nothing to save");
    return;
  }

  // Never replace a bigger snapshot with a smaller one (e.g. after a wiped DB
  // and an interrupted re-fetch), unless --force is given.
  if (fs.existsSync(SEED_FILE) && !force) {
    try {
      const prev = JSON.parse(gunzipSync(fs.readFileSync(SEED_FILE)).toString());
      const prevTotal = TABLES.reduce((n, t) => n + (prev.data[t]?.length ?? 0), 0);
      if (total < prevTotal) {
        console.log(
          `[export] kept existing snapshot (${prevTotal} rows) - current catalog is smaller (${total}). Use --force to overwrite.`
        );
        return;
      }
    } catch {
      // unreadable old file: fall through and overwrite
    }
  }

  fs.mkdirSync(path.dirname(SEED_FILE), { recursive: true });
  const payload = { version: 1, exportedAt: new Date().toISOString(), data };
  fs.writeFileSync(SEED_FILE, gzipSync(JSON.stringify(payload)));
  const mb = (fs.statSync(SEED_FILE).size / 1048576).toFixed(1);
  console.log(
    `[export] saved ${total} rows (${TABLES.map((t) => `${data[t].length} ${t}`).join(", ")}) → db-seed/catalog.json.gz (${mb} MB)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
