import CategoryPage from "@/components/category/CategoryPage";
import { prisma } from "@/lib/prisma";
import { queryCatalog } from "@/lib/catalog-query";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const [items, total] = await Promise.all([
    queryCatalog({ type: "GAME", take: 20 }),
    prisma.game.count(),
  ]);

  return (
    <CategoryPage
      kind="game"
      title="Games"
      description="Log your playthroughs, manage your backlog, and track exactly how far you've gotten."
      stats={[
        { label: "Games in catalog", value: total.toLocaleString() },
        { label: "Source", value: "IGDB" },
        { label: "Last synced", value: "Automatic daily check" },
      ]}
      items={items}
      hasMore={items.length === 20 && total > 20}
    />
  );
}
