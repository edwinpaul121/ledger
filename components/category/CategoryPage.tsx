import type { MediaKind } from "@/components/landing/MediaTag";
import CategoryHero from "./CategoryHero";
import CategoryBrowser from "./CategoryBrowser";
import type { GridItem } from "./MediaGrid";

export default function CategoryPage({
  kind,
  title,
  description,
  stats,
  items,
  hasMore = false,
}: {
  kind: MediaKind;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
  items: GridItem[];
  hasMore?: boolean;
}) {
  return (
    <main>
      <CategoryHero kind={kind} title={title} description={description} stats={stats} />

      <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-14 md:px-20">
        <CategoryBrowser kind={kind} initialItems={items} initialHasMore={hasMore} />
      </section>
    </main>
  );
}
