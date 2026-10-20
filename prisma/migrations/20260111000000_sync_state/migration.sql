-- CreateTable
CREATE TABLE "sync_state" (
    "key" TEXT NOT NULL,
    "remoteCount" INTEGER NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_state_pkey" PRIMARY KEY ("key")
);
