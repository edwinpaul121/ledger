-- CreateTable
CREATE TABLE "catalog_meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_meta_pkey" PRIMARY KEY ("key")
);
