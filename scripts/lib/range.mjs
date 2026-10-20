// Shared release-date window + slicing for every catalog import.
//
// Start year per type (override in .env):
//   IMPORT_FROM_YEAR_MOVIES (1888)  IMPORT_FROM_YEAR_SHOWS (1888)
//   IMPORT_FROM_YEAR_GAMES  (1950)  IMPORT_FROM_YEAR_BOOKS (1800)
// End year (all types): IMPORT_TO_YEAR, default = current year, never later than today.
//
// IMPORT_FROM_DATE / IMPORT_TO_DATE (YYYY-MM-DD) override the years - the daily
// sync uses these, together with IMPORT_RELAXED=1 (no quality filters, so brand
// new releases with no votes yet still come through).
const DEFAULT_FROM = { movies: 1888, shows: 1888, games: 1950, books: 1800 };

export function getRange(type) {
  const today = new Date().toISOString().slice(0, 10);
  const thisYear = new Date().getFullYear();
  const fromYear = Number(
    process.env[`IMPORT_FROM_YEAR_${type.toUpperCase()}`] || DEFAULT_FROM[type] || 2000
  );
  const toYear = Number(process.env.IMPORT_TO_YEAR || thisYear);

  const from = process.env.IMPORT_FROM_DATE || `${fromYear}-01-01`;
  let to = process.env.IMPORT_TO_DATE || `${toYear}-12-31`;
  if (to > today) to = today;

  return {
    ...bounds(from, to),
    relaxed: process.env.IMPORT_RELAXED === "1",
  };
}

function bounds(from, to) {
  return {
    from,
    to,
    fromYear: Number(from.slice(0, 4)),
    toYear: Number(to.slice(0, 4)),
    fromTs: Math.floor(new Date(`${from}T00:00:00Z`).getTime() / 1000),
    toTs: Math.floor(new Date(`${to}T23:59:59Z`).getTime() / 1000),
  };
}

// Splits the range into chunks of `years` (aligned to multiples, e.g. decades).
// Each chunk gets its own page budget, so every era is represented instead of
// the most-popular-today titles crowding out everything older.
export function slices(range, years) {
  const out = [];
  for (let y = Math.floor(range.fromYear / years) * years; y <= range.toYear; y += years) {
    const from = range.from > `${y}-01-01` ? range.from : `${y}-01-01`;
    const endYear = `${y + years - 1}-12-31`;
    const to = range.to < endYear ? range.to : endYear;
    if (from <= to) out.push(bounds(from, to));
  }
  return out;
}
