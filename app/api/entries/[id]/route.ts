import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const existing = await prisma.entry.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { status, progressLabel, rating, favorite } = await req.json();

  try {
    const updated = await prisma.entry.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(progressLabel !== undefined && { progressLabel }),
        ...(rating !== undefined && { rating }),
        ...(favorite !== undefined && { favorite }),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update entry:", err);
    return NextResponse.json({ error: "Couldn't save that change." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const existing = await prisma.entry.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.entry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
