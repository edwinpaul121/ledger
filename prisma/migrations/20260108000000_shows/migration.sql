-- CreateTable
CREATE TABLE "shows" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "firstAirDate" TIMESTAMP(3),
    "status" TEXT,
    "genres" TEXT,
    "voteAverage" DOUBLE PRECISION,
    "voteCount" INTEGER,
    "popularity" DOUBLE PRECISION,
    "numberOfSeasons" INTEGER,
    "numberOfEpisodes" INTEGER,
    "cast" JSONB,
    "crew" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT,
    "overview" TEXT,
    "posterPath" TEXT,
    "episodeCount" INTEGER,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "name" TEXT,
    "overview" TEXT,
    "airDate" TIMESTAMP(3),
    "stillPath" TEXT,
    "runtime" INTEGER,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "episode_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shows_tmdbId_key" ON "shows"("tmdbId");
CREATE INDEX "shows_popularity_idx" ON "shows"("popularity");
CREATE UNIQUE INDEX "seasons_showId_seasonNumber_key" ON "seasons"("showId", "seasonNumber");
CREATE UNIQUE INDEX "episodes_seasonId_episodeNumber_key" ON "episodes"("seasonId", "episodeNumber");
CREATE INDEX "episodes_showId_idx" ON "episodes"("showId");
CREATE UNIQUE INDEX "episode_progress_userId_episodeId_key" ON "episode_progress"("userId", "episodeId");

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_showId_fkey" FOREIGN KEY ("showId") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "episode_progress" ADD CONSTRAINT "episode_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "episode_progress" ADD CONSTRAINT "episode_progress_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: link entries, list_items, and view_history to shows
ALTER TABLE "entries" ADD COLUMN "showId" TEXT;
CREATE UNIQUE INDEX "entries_userId_showId_key" ON "entries"("userId", "showId");
ALTER TABLE "entries" ADD CONSTRAINT "entries_showId_fkey" FOREIGN KEY ("showId") REFERENCES "shows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "list_items" ADD COLUMN "showId" TEXT;
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_showId_fkey" FOREIGN KEY ("showId") REFERENCES "shows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "view_history" ADD COLUMN "showId" TEXT;
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_showId_fkey" FOREIGN KEY ("showId") REFERENCES "shows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
