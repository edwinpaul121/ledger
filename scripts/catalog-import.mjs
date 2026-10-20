// Restores db-seed/catalog.json.gz into the database. Safe to run any time:
// rows that already exist are skipped, nothing is deleted, user data untouched.
//   npm run catalog:import
import { PrismaClient } from "@prisma/client";
import { gunzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";

const SEED_FILE = path.resolve("db-seed", "catalog.json.gz");
const TABLES = ["movie", "show", "season", "episode", "game", "book", "catalogMeta"];
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const prisma = new PrismaClient();

// JSON turns dates into strings and Prisma wants Dates back; null JSON columns
// can't be passed to createMany, so nulls are simply omitted (they default to null).
function revive(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null) continue;
    out[k] = typeof v === "string" && ISO.test(v) ? new Date(v) : v;
  }
  return out;
}

async function main() {
  if (!fs.existsSync(SEED_FILE)) {
    console.log("[import] no snapshot at db-seed/catalog.json.gz - nothing to restore");
    return;
  }
  const { data, exportedAt } = JSON.parse(gunzipSync(fs.readFileSync(SEED_FILE)).toString());
  console.log(`[import] restoring snapshot from ${exportedAt}`);

  for (const t of TABLES) {
    const rows = (data[t] ?? []).map(revive);
    let added = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const res = await prisma[t].createMany({ data: rows.slice(i, i + 500), skipDuplicates: true });
      added += res.count;
    }
    console.log(`[import] ${t}: ${added} added, ${rows.length - added} already present`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
