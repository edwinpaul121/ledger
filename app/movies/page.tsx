import CategoryPage from "@/components/category/CategoryPage";
import { prisma } from "@/lib/prisma";
import { queryCatalog } from "@/lib/catalog-query";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const [items, total] = await Promise.all([
    queryCatalog({ type: "FILM", take: 20 }),
    prisma.movie.count(),
  ]);

  return (
    <CategoryPage
      kind="film"
      title="Movies"
      description="Everything from opening-night premieres to the classics you've been meaning to rewatch."
      stats={[
        { label: "Movies in catalog", value: total.toLocaleString() },
        { label: "Source", value: "TMDB" },
        { label: "Last synced", value: "Automatic daily check" },
      ]}
      items={items}
      hasMore={items.length === 20 && total > 20}
    />
  );
}
