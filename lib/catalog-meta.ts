import { prisma } from "@/lib/prisma";

// Reads a catalog_meta value (e.g. "books_dump_date"). Returns null instead of
// throwing if the table/client isn't available yet, so pages never break on it.
export async function getCatalogMeta(key: string): Promise<string | null> {
  try {
    const row = await prisma.catalogMeta.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}
