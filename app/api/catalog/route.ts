import { NextResponse } from "next/server";
import { queryCatalog, parseSort, type CatalogType } from "@/lib/catalog-query";

const TYPES: CatalogType[] = ["FILM", "SHOW", "GAME", "BOOK"];

// GET /api/catalog?type=FILM&q=dune&sort=rating&skip=0&take=20
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as CatalogType | null;
  if (!type || !TYPES.includes(type)) {
    return NextResponse.json({ items: [], hasMore: false });
  }

  const skip = Math.max(0, Number(searchParams.get("skip") ?? 0) || 0);
  const take = Math.min(Math.max(1, Number(searchParams.get("take") ?? 20) || 20), 50);

  try {
    const items = await queryCatalog({
      type,
      q: searchParams.get("q") ?? "",
      sort: parseSort(searchParams.get("sort")),
      skip,
      take,
    });
    return NextResponse.json({ items, hasMore: items.length === take });
  } catch (err) {
    console.error("Catalog query failed:", err);
    return NextResponse.json({ items: [], hasMore: false, error: "Query failed." }, { status: 500 });
  }
}
