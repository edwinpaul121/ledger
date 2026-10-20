import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { mediaType, title, status, progressLabel } = await req.json();

  if (!mediaType || !title) {
    return NextResponse.json({ error: "A title and media type are required." }, { status: 400 });
  }

  try {
    const entry = await prisma.entry.create({
      data: {
        userId,
        mediaType,
        title,
        status: status ?? "PLANNED",
        progressLabel: progressLabel || null,
      },
    });
    return NextResponse.json(entry);
  } catch (err) {
    console.error("Failed to create entry:", err);
    return NextResponse.json({ error: "Couldn't add that." }, { status: 500 });
  }
}
