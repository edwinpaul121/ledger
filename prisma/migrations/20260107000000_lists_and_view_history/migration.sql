-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('FILM', 'SHOW', 'GAME', 'BOOK', 'MIX');

-- AlterTable
ALTER TABLE "lists" ADD COLUMN "type" "ListType" NOT NULL DEFAULT 'MIX';

-- AlterTable
ALTER TABLE "list_items" ADD COLUMN "movieId" TEXT;

-- AddForeignKey
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "view_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT,
    "movieId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "view_history_userId_path_key" ON "view_history"("userId", "path");

-- CreateIndex
CREATE INDEX "view_history_userId_idx" ON "view_history"("userId");

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
