-- AlterTable: enrich movies with full detail fields
ALTER TABLE "movies" ADD COLUMN "originalTitle" TEXT;
ALTER TABLE "movies" ADD COLUMN "status" TEXT;
ALTER TABLE "movies" ADD COLUMN "originalLanguage" TEXT;
ALTER TABLE "movies" ADD COLUMN "budget" DOUBLE PRECISION;
ALTER TABLE "movies" ADD COLUMN "revenue" DOUBLE PRECISION;
ALTER TABLE "movies" ADD COLUMN "productionCompanies" TEXT;
ALTER TABLE "movies" ADD COLUMN "spokenLanguages" TEXT;
ALTER TABLE "movies" ADD COLUMN "cast" JSONB;

-- AlterTable: link entries to a real catalog movie, and add favorite
ALTER TABLE "entries" ADD COLUMN "movieId" TEXT;
ALTER TABLE "entries" ADD COLUMN "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "entries_userId_movieId_key" ON "entries"("userId", "movieId");

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
