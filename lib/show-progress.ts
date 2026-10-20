import { prisma } from "@/lib/prisma";

/**
 * Looks at everything a user has watched for a show and recomputes the
 * show's single tracking Entry: what's "up next", whether it's in progress,
 * and whether the whole series is now complete.
 */
export async function recomputeShowProgress(userId: string, showId: string) {
  const episodes = await prisma.episode.findMany({
    where: { showId },
    orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
  });
  if (episodes.length === 0) return;

  const watched = await prisma.episodeProgress.findMany({
    where: { userId, episodeId: { in: episodes.map((e) => e.id) } },
    select: { episodeId: true },
  });
  const watchedIds = new Set(watched.map((w) => w.episodeId));

  let lastWatchedIndex = -1;
  for (let i = 0; i < episodes.length; i++) {
    if (watchedIds.has(episodes[i].id)) lastWatchedIndex = i;
  }

  const allWatched = watchedIds.size === episodes.length;
  const nextEpisode = episodes.slice(lastWatchedIndex + 1).find((e) => !watchedIds.has(e.id));
  const show = await prisma.show.findUnique({ where: { id: showId } });
  const title = show?.name ?? "Show";

  if (allWatched) {
    await prisma.entry.upsert({
      where: { userId_showId: { userId, showId } },
      create: {
        userId,
        showId,
        mediaType: "SHOW",
        title,
        status: "COMPLETED",
        progressLabel: "Series completed",
        finishedAt: new Date(),
      },
      update: { status: "COMPLETED", progressLabel: "Series completed", finishedAt: new Date() },
    });
    return;
  }

  const progressLabel = nextEpisode
    ? `Up next: S${nextEpisode.seasonNumber}E${nextEpisode.episodeNumber}`
    : null;

  await prisma.entry.upsert({
    where: { userId_showId: { userId, showId } },
    create: {
      userId,
      showId,
      mediaType: "SHOW",
      title,
      status: lastWatchedIndex >= 0 ? "IN_PROGRESS" : null,
      progressLabel,
      ...(lastWatchedIndex >= 0 && { startedAt: new Date() }),
    },
    update: {
      ...(lastWatchedIndex >= 0 && { status: "IN_PROGRESS" }),
      progressLabel,
    },
  });
}

export async function setEpisodeWatched(userId: string, episodeId: string, watched: boolean) {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) throw new Error("Episode not found");

  if (watched) {
    await prisma.episodeProgress.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: { userId, episodeId },
      update: {},
    });
  } else {
    await prisma.episodeProgress.deleteMany({ where: { userId, episodeId } });
  }

  await recomputeShowProgress(userId, episode.showId);
}

export async function setSeasonWatched(userId: string, seasonId: string, watched: boolean) {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: { episodes: true },
  });
  if (!season) throw new Error("Season not found");

  if (watched) {
    await prisma.$transaction(
      season.episodes.map((ep) =>
        prisma.episodeProgress.upsert({
          where: { userId_episodeId: { userId, episodeId: ep.id } },
          create: { userId, episodeId: ep.id },
          update: {},
        })
      )
    );
  } else {
    await prisma.episodeProgress.deleteMany({
      where: { userId, episodeId: { in: season.episodes.map((e) => e.id) } },
    });
  }

  await recomputeShowProgress(userId, season.showId);
}
