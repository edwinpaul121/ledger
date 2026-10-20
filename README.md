# Ledger

A single place to track films, shows, games, and books.

## Setup (Docker)

The app runs as two containers: `web` (Next.js) and `db` (Postgres).

1. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Generate a secret for `NEXTAUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

   Get all API keys and add it to .env
2. **Run it**

   ```bash
   docker compose up --build
   ```

   First run creates the Postgres volume and applies Prisma migrations
   automatically before the dev server starts. Open
   http://localhost:3000 for the app.

   Source files are bind-mounted, so edits on your machine hot-reload in
   the container same as running `next dev` locally.

3. **Everyday commands**

   ```bash
   docker compose up -d          # start in the background
   docker compose logs -f web    # tail the app logs
   docker compose exec web npx prisma studio   # browse the database
   docker compose down           # stop (add -v to also wipe the db volume)
   ```

> **Note:** this repo doesn't include a `package-lock.json` yet (it was
> built without network access). Run `npm install` once — inside the `web`
> container (`docker compose run --rm web npm install`) or locally — and
> commit the generated lockfile before building the production image;
> `npm ci` in the prod `Dockerfile` requires one.


### Running without Docker

You'll need your own Postgres instance. Point `DATABASE_URL` in `.env` at
it, then:

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## Populating real movie data (TMDB)

Movies are sourced from [TMDB](https://www.themoviedb.org/). This is a
one-time import for now — not scheduled/automatic yet.

1. Get a free API key: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Add it to `.env`:
   ```
   TMDB_API_KEY="your-key-here"
   ```
3. Restart so the container picks up the new env var, then run the import:
   ```bash
   docker compose up -d
   docker compose exec web npm run fetch:movies
   ```
   This pulls ~10 pages (200 movies) from TMDB's "popular" list and upserts
   them into the `movies` table. Re-running it is safe — it updates existing
   rows by TMDB id rather than duplicating them. Adjust how much it pulls
   with `TMDB_PAGES=20 docker compose exec web npm run fetch:movies` (20
   movies per page).

## Populating real TV data (TMDB)

Same idea as movies, using `npm run fetch:shows`. This one is heavier:
each show needs a details call plus one call per season, so it defaults to
5 pages (100 shows) instead of movies' 10.

```bash
docker compose exec web npm run fetch:shows
```

Adjust with `TMDB_SHOW_PAGES=10` (more shows) and `TMDB_MAX_SEASONS=5`
(caps how many seasons of a long-running show get imported, default 10) -
e.g. `TMDB_SHOW_PAGES=10 TMDB_MAX_SEASONS=5 docker compose exec web npm run fetch:shows`.


## Populating real game data (IGDB)

Games are sourced from [IGDB](https://www.igdb.com/), which authenticates
through Twitch rather than a plain API key:

1. Register a Twitch Developer app: [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
   (you need a Twitch account, but the app itself is free and instant)
2. Add its Client ID and Client Secret to `.env`:
   ```
   IGDB_CLIENT_ID="..."
   IGDB_CLIENT_SECRET="..."
   ```
3. Restart and run the import:
   ```bash
   docker compose up -d
   docker compose exec web npm run fetch:games
   ```

## Populating real book data (Open Library data dump)

Books come from Open Library's **monthly data dumps**, which is the way they
ask bulk data to be fetched (their API asks not to be used for that). No API
key needed; optionally set a contact email for the User-Agent:

```
OPENLIBRARY_CONTACT="you@example.com"
```

```bash
docker compose exec web npm run fetch:books
```

The importer streams four files straight from the network (about 3.5 GB in
total, nothing large is saved to disk, expect several minutes): the reading
log (how many readers shelved each work, used as popularity), ratings, works
and authors. It keeps the most-shelved works that have a cover, up to
`OL_MAX_BOOKS` (5000), from `IMPORT_FROM_YEAR_BOOKS` (1800) onwards. Works with
no recorded first-publish date are kept, with the year left blank.

**Prefer to download the dump yourself?** Get these four files from
[openlibrary.org/developers/dumps](https://openlibrary.org/developers/dumps)
(browser or `curl -C -`, which can resume) and put them, still gzipped, in
`db-seed/openlibrary/`. The files might come as plain text (.txt) so I'd still 
recommend running gzip on them as the code was also built for that specifically:

```
ol_dump_works_YYYY-MM-DD.txt.gz       (~2.9 GB)
ol_dump_authors_YYYY-MM-DD.txt.gz     (~0.5 GB)
ol_dump_ratings_YYYY-MM-DD.txt.gz     (~5 MB)
ol_dump_reading-log_YYYY-MM-DD.txt.gz (~65 MB)
```

The importer uses any file it finds there instead of downloading it (keep the
date in the file name: it's what gets recorded and shown as the dump date).
The folder is git-ignored and excluded from Docker builds. Then run
`docker compose exec web npm run fetch:books`.


## Automatic catalog fill + daily updates

You no longer have to run the `fetch:*` scripts by hand. In the dev Docker
setup, a background job starts with the app and:

1. **Backfills on first start.** Any empty catalog (movies, shows, games,
   books) is filled with quality titles from a start year up to today:
   movies and shows from 1888, games from 1950, books from 1800 (change with
   `IMPORT_FROM_YEAR_MOVIES|SHOWS|GAMES|BOOKS`, and `IMPORT_TO_YEAR` for the
   end). Movies, shows and games are split into decades and each decade gets
   its own page budget, so old classics are represented too, not just whatever
   is popular today. Books come from the Open Library data dump (above).
2. **Applies a quality filter.** Movies need 100+ votes and a poster, shows
   50+ votes and a poster, games a cover and 5+ ratings, books a cover and 10+
   readers. Thresholds are in `.env.example`.
3. **Checks every 24 hours.** It asks each source how many titles were
   released in the last `SYNC_WINDOW_DAYS` (default 30). Only if that number
   grew since the last check does it fetch anything (without the quality
   filter, since brand-new titles have no votes yet); otherwise it logs
   "no new entries" and stops. For books it checks the Open Library search API for
   newly added works (the dump is only used for the first fill).

With the defaults the first start imports roughly 3-4k movies, 1k shows,
1.5-2k games and up to 5k books, and takes **a good while** (shows are the
slowest, with one request per season). It runs in the background, so the app
is usable meanwhile and fills in as it goes. Lower the page budgets for a
faster first run.

### Catalog snapshot (skip re-fetching)

After every successful fetch the job saves the whole catalog (movies, shows,
seasons, episodes, games, books) to `db-seed/catalog.json.gz` in your project
folder. If the catalog is ever empty (e.g. after `docker compose down -v`),
it is restored from that file on the next start - in seconds, with no API
calls - and only anything newer is fetched. It never contains users, lists or
tracking data, and a smaller snapshot never overwrites a bigger one.

```bash
docker compose exec web npm run catalog:export   # save now (add -- --force to overwrite)
docker compose exec web npm run catalog:import   # restore now (skips rows that exist)
```

Keep a copy of the file somewhere safe. It is git-ignored because it's large
and comes from third-party APIs. To back up **everything** including accounts
and lists, use Postgres directly:

```bash
docker compose exec -T db pg_dump -U ledger ledger > backup.sql
docker compose exec -T db psql -U ledger ledger < backup.sql   # restore into an empty DB
```

The data lives in the `db_data` Docker volume, so it survives restarts and
rebuilds. It is only erased by `docker compose down -v`, and after that the
backfill simply runs again. Set `AUTO_CATALOG=false` to switch it off, or run
a check manually with `docker compose exec web npm run sync:catalog`.
Watch it with `docker compose logs -f web`.

The production compose file doesn't run the job; schedule
`npm run sync:catalog` with your host's cron instead.

## Data sources & attribution

- **TMDB** (movies, shows): free for non-commercial use with attribution. The
  required notice is in the footer and on `/credits`.
- **IGDB** (games): used under the Twitch Developer Service Agreement.
- **Open Library** (books): the initial fill comes from their monthly data
  dump (date shown in the app); later additions are a few small API lookups.


### Speed and resuming

Movie and show imports make requests in parallel (`TMDB_CONCURRENCY`, default
10 for movies; shows fetch 4 at a time since each needs a call per season),
retry on rate limits and server errors, and **skip titles imported in the last
`TMDB_REFRESH_DAYS` (30) days**. If a long import is interrupted, run it again
(`docker compose exec web npm run fetch:movies`) and it picks up where it
left off, almost instantly skipping everything already saved.
