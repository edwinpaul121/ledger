import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const show = await prisma.show.findUnique({ where: { id: params.id } });
  if (!show) return NextResponse.json({ error: "Show not found." }, { status: 404 });

  const { favorite, status } = await req.json();
  const now = new Date();
  const startingWatch = status === "IN_PROGRESS";
  const completingNow = status === "COMPLETED";

  try {
    const entry = await prisma.entry.upsert({
      where: { userId_showId: { userId, showId: show.id } },
      create: {
        userId,
        showId: show.id,
        mediaType: "SHOW",
        title: show.name,
        status: status ?? null,
        favorite: favorite ?? false,
        ...(startingWatch && { startedAt: now }),
        ...(completingNow && { finishedAt: now }),
      },
      update: {
        ...(status !== undefined && { status }),
        ...(favorite !== undefined && { favorite }),
        ...(startingWatch && { startedAt: now }),
        ...(completingNow && { finishedAt: now }),
      },
    });
    return NextResponse.json({ ...entry, moviePosterPath: show.posterPath });
  } catch (err) {
    console.error("Failed to upsert entry for show track:", err);
    return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
  }
}
