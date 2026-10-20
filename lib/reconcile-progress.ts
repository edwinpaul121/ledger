import { prisma } from "@/lib/prisma";

/**
 * Flips any of this user's IN_PROGRESS movie entries to COMPLETED once the
 * movie's runtime has elapsed since they started watching. Scoped to a
 * single user and only runs when triggered by that user's own page views -
 * no background job or scheduler required.
 */
export async function reconcileWatchedEntries(userId: string) {
  try {
    await prisma.$executeRaw`
      UPDATE entries e
      SET status = 'COMPLETED', "finishedAt" = now()
      FROM movies m
      WHERE e."movieId" = m.id
        AND e."userId" = ${userId}
        AND e.status = 'IN_PROGRESS'
        AND e."startedAt" IS NOT NULL
        AND m.runtime IS NOT NULL
        AND e."startedAt" + (m.runtime * interval '1 minute') <= now()
    `;
  } catch (err) {
    console.error("Failed to reconcile watched entries:", err);
  }
}
