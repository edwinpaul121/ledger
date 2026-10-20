import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { rowOrder } = await req.json();
  if (!Array.isArray(rowOrder)) {
    return NextResponse.json({ error: "rowOrder must be an array." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { rowOrder: rowOrder.join(",") },
  });

  return NextResponse.json({ ok: true });
}
