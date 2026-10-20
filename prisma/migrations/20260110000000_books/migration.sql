-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "olid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "description" TEXT,
    "coverId" INTEGER,
    "firstPublishYear" INTEGER,
    "subjects" TEXT,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "popularity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "books_olid_key" ON "books"("olid");
CREATE INDEX "books_popularity_idx" ON "books"("popularity");

ALTER TABLE "entries" ADD COLUMN "bookId" TEXT;
CREATE UNIQUE INDEX "entries_userId_bookId_key" ON "entries"("userId", "bookId");
ALTER TABLE "entries" ADD CONSTRAINT "entries_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "list_items" ADD COLUMN "bookId" TEXT;
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "view_history" ADD COLUMN "bookId" TEXT;
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
