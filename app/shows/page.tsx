import CategoryPage from "@/components/category/CategoryPage";
import { prisma } from "@/lib/prisma";
import { queryCatalog } from "@/lib/catalog-query";

export const dynamic = "force-dynamic";

export default async function ShowsPage() {
  const [items, total] = await Promise.all([
    queryCatalog({ type: "SHOW", take: 20 }),
    prisma.show.count(),
  ]);

  return (
    <CategoryPage
      kind="show"
      title="Shows"
      description="Track every season, keep tabs on what's mid-binge, and never lose your place again."
      stats={[
        { label: "Shows in catalog", value: total.toLocaleString() },
        { label: "Source", value: "TMDB" },
        { label: "Last synced", value: "Automatic daily check" },
      ]}
      items={items}
      hasMore={items.length === 20 && total > 20}
    />
  );
}
