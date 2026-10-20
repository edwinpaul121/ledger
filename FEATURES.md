# Ledger — Feature Chart

A running record of what's been built, updated as the project grows. Legend:
✅ done and wired to real data · 🟡 built but limited/placeholder · ⬜ not started.

## Auth & Accounts

| Feature | Status | Notes |
|---|---|---|
| Email/password sign up & sign in | ✅ | Auth.js + Prisma, bcrypt-hashed passwords |
| Google / GitHub OAuth | 🟡 | Wired, activates once API keys are added to `.env` |
| Session validity check | ✅ | Verifies the user still exists in the DB on every session check, so a stale cookie after a dev DB reset can't fake a signed-in state |
| Sign-in redirect | ✅ | Lands on `/trending` after sign in |
| "Sign in" modal | ✅ | Opens over the current page via Next.js intercepting routes; `/login` also works as a real page |

## Movies (the one fully-sourced category so far)

| Feature | Status | Notes |
|---|---|---|
| Catalog import from TMDB | ✅ | One-time script (`npm run fetch:movies`), not scheduled/daily yet |
| Movie detail page | ✅ | Backdrop-as-background, poster, overview, full details grid (budget/revenue/languages/etc.), director & writer, cast row + full cast & crew toggle |
| Favorite | ✅ | Persisted per user, independent of tracking status |
| Add to Watchlist | ✅ | Persisted; mutually exclusive with "Completed" (same underlying status field) |
| Mark as Completed | ✅ | Persisted; mutually exclusive with Watchlist |
| Add to List | ✅ | Shows real-time "already in this list" state, not just this-session clicks |
| Start Watching / auto-complete | ✅ | Sets status to In Progress + timestamps `startedAt`; automatically flips to Completed once the movie's runtime has elapsed, reconciled opportunistically on page load (no scheduler/worker needed) |
| Reviews | 🟡 | Fully interactive UI (spoiler hide/reveal, shows your name) but **not persisted to the database yet** — resets on refresh, by design for now |
| Star ratings | ⬜ | Not started |
| Browse page (`/movies`) | ✅ | Real pagination ("Load more" against the actual catalog), sourced from the DB |

## Shows

| Feature | Status | Notes |
|---|---|---|
| Catalog import from TMDB | ✅ | One-time script (`npm run fetch:shows`), pulls shows + seasons + episodes. Heavier than the movie import (one extra call per season), defaults to 5 pages instead of movies' 10 |
| Show detail page | ✅ | Backdrop-as-background, poster, overview, cast/crew row, current progress ("Up next: S2E3") shown near the title |
| Episode tracking | ✅ | Mark individual episodes watched/unwatched, grouped by season |
| Season tracking | ✅ | "Mark season watched" toggles every episode in that season at once |
| Auto-advance | ✅ | Watching an episode automatically updates the show's overall status (In Progress) and progress label (next episode up); finishing every episode marks the show Completed |
| Favorite | ✅ | Persisted per user, independent of tracking status |
| Add to Watchlist | ✅ | Explicit "I plan to watch this" - separate from the episode-driven auto progress |
| Add to List | ✅ | Same persisted "already in this list" behavior as movies |
| Browse page (`/shows`) | ✅ | Real pagination, sourced from the DB, catalog search wired into dashboard quick-add |
| Notify on new episode release | ⬜ | Planned, not built. Would need: a scheduled TMDB refresh (the current import is one-time only), a way to detect "aired since you last checked," and a `Notification` model + delivery (in-app bell and/or email) |

## Games

| Feature | Status | Notes |
|---|---|---|
| Catalog import from IGDB | ✅ | One-time script (`npm run fetch:games`). Auth goes through Twitch (client credentials), then IGDB expands genres/platforms/companies/screenshots inline in one query per page - no per-game detail calls needed, unlike movies/shows |
| Game detail page | ✅ | Cover, screenshots gallery, platforms/developer/publisher, game modes, time-to-beat (main story & completionist), critic rating |
| Favorite | ✅ | Persisted per user, independent of tracking status |
| Add to Watchlist / Start Playing / Mark Completed | ✅ | Same unified single-status model as movies/shows - the three are mutually exclusive since they're one field |
| Progress tracking | ✅ | Freeform field shown while "Playing" (e.g. "Chapter 5", "68%") - no auto-complete-by-time the way movies have, since a 40-hour game can't be timed like a 2-hour movie |
| Add to List | ✅ | Same persisted "already in this list" behavior as movies/shows |
| Browse page (`/games`) | ✅ | Real pagination, sourced from the DB, catalog search wired into dashboard quick-add |

## Books

| Feature | Status | Notes |
|---|---|---|
| Catalog import from Open Library data dump | ✅ | `npm run fetch:books` streams the monthly dumps (reading log, ratings, works, authors) instead of hammering the API. Most-shelved works with covers; the dump date is stored (`catalog_meta`) and shown on the Books and Credits pages. Used for the initial fill only |
| Incremental book updates | ✅ | Daily check asks Open Library how many works exist for the current period and, only if it grew, adds the newest ~50 missing ones via a few API calls (`npm run fetch:books:recent`) - never re-imports the dump |
| Book detail page | ✅ | Cover, author(s), first-published year, rating, description, subjects |
| Favorite | ✅ | Persisted per user, independent of tracking status |
| Add to Watchlist / Start Reading / Mark Completed | ✅ | Same unified single-status model as the other media types |
| Progress tracking | ✅ | Freeform field shown while "Reading" (e.g. "Page 210", "Chapter 5") |
| Add to List | ✅ | Same persisted "already in this list" behavior |
| Browse page (`/books`) | ✅ | Real pagination from the DB, catalog search wired into dashboard quick-add |

## Catalog automation

| Feature | Status | Notes |
|---|---|---|
| Year-range import | ✅ | Per-type start years (movies/shows 1888, games 1950, books 1800) up to today, split into decades/eras with a page budget each so old titles are represented |
| Quality filter | ✅ | Minimum votes/ratings/editions plus poster/cover requirements, tunable in `.env`; relaxed for the daily new-release check |
| First-run backfill | ✅ | Empty catalogs are filled automatically when the dev container starts |
| Daily new-release check | ✅ | Every 24h each source is asked how many titles exist in the recent window; it only fetches when that count has grown (`sync_state` table) |
| Credits & attribution | ✅ | Site-wide strip with the TMDB notice, plus a `/credits` page for TMDB, IGDB and Open Library (incl. the book dump date) |
| Catalog snapshot | ✅ | Catalog auto-saved to `db-seed/catalog.json.gz` after fetches and auto-restored when the tables are empty, so rebuilds skip the slow API import. Excludes user data |

## Browsing, filters & search

| Feature | Status | Notes |
|---|---|---|
| Sort filters (Popular / Top Rated / New Releases / A–Z) | ✅ | On every category page, applied server-side across the whole catalog (not just loaded cards) |
| Category search | ✅ | Debounced title search on each category page (books also match author) |
| Trending search | ✅ | One box on `/trending` searches movies, shows, games and books at once and shows a row per category; clear it to get the trending rows back |

## Dashboard

| Feature | Status | Notes |
|---|---|---|
| 3-column library (Backlog / Currently Tracking / Completed) | ✅ | Each column filterable by media type, shows 5 most recent, links to a full page per status |
| Quick add | ✅ | Real catalog search (movies, shows, and games now) — no more freeform text creating fake entries |
| Favorites | ✅ | Top 6 on dashboard, full list at `/dashboard/favorites` |
| Recently Viewed | ✅ | Sourced from real page-view history (any page visited, not just tracked items), horizontal scroll |
| Custom Lists | ✅ | Typed on creation (Movies/TV/Games/Books/Mix), catalog-search add, top-4 preview + full list page with filters at `/dashboard/lists/[id]`, items link to their real detail page (link logic is mediaType-aware, ready for Shows/Games/Books once they have detail pages) |
| Progress tracking (episode/page/level) | ✅ | Freeform `progressLabel` field per entry |

## Social

| Feature | Status | Notes |
|---|---|---|
| Activity feed | 🟡 | Real UI, hardcoded sample data — no `Friend`/`Follow` model yet |
| Find/add friends | 🟡 | UI works (search box, Add button toggles state) but not connected to a real friendship system |

## Site-wide

| Feature | Status | Notes |
|---|---|---|
| Nav: Trending / Movies / Shows / Games / Books / Social | ✅ | Active route highlighted |
| Trending page | ✅ | One row per category, ranked by what users tracked in the last 7 days, topped up with TMDB/IGDB/Open Library popularity from the imported catalogs. Each card links to its detail page and shows a "N tracking" badge |
| Design system | ✅ | Dark navy/mint/indigo palette, Young Serif + Geist, per-category tag colors |
| Docker | ✅ | `docker-compose.yml` for dev (hot reload), `docker-compose.prod.yml` + multi-stage `Dockerfile` for a production-style build |

---

*Last updated: after adding Books - Open Library catalog import, detail pages, tracking, and wiring books into favorites/watchlist/lists/backlog alongside movies, shows and games. Also fixed Recently Viewed to save game/book links and show the right cover host. I'll keep this current each time we add or change a feature.*
