-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "igdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "storyline" TEXT,
    "coverImageId" TEXT,
    "screenshots" JSONB,
    "releaseDate" TIMESTAMP(3),
    "genres" TEXT,
    "platforms" TEXT,
    "gameModes" TEXT,
    "developer" TEXT,
    "publisher" TEXT,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "popularity" DOUBLE PRECISION,
    "timeToBeatMainMinutes" INTEGER,
    "timeToBeatCompleteMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_igdbId_key" ON "games"("igdbId");
CREATE INDEX "games_popularity_idx" ON "games"("popularity");

-- AlterTable: link entries, list_items, view_history to games
ALTER TABLE "entries" ADD COLUMN "gameId" TEXT;
CREATE UNIQUE INDEX "entries_userId_gameId_key" ON "entries"("userId", "gameId");
ALTER TABLE "entries" ADD CONSTRAINT "entries_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "list_items" ADD COLUMN "gameId" TEXT;
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "view_history" ADD COLUMN "gameId" TEXT;
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
