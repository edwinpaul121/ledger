import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { setSeasonWatched } from "@/lib/show-progress";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { watched } = await req.json();

  try {
    await setSeasonWatched(userId, params.id, !!watched);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update season progress:", err);
    return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
  }
}
