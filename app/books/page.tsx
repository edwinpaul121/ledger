import CategoryPage from "@/components/category/CategoryPage";
import { prisma } from "@/lib/prisma";
import { queryCatalog } from "@/lib/catalog-query";
import { getCatalogMeta } from "@/lib/catalog-meta";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const [items, total] = await Promise.all([
    queryCatalog({ type: "BOOK", take: 20 }),
    prisma.book.count(),
  ]);

  // Provenance of the base import. Never let a missing table/row break the page.
  const dump = await getCatalogMeta("books_dump_date");

  return (
    <CategoryPage
      kind="book"
      title="Books"
      description="Keep a running shelf of what you're reading, what's next, and what you finished last year."
      stats={[
        { label: "Books in catalog", value: total.toLocaleString() },
        { label: "Source", value: "Open Library" },
        { label: "Data dump from", value: dump ?? "Not imported yet" },
      ]}
      items={items}
      hasMore={items.length === 20 && total > 20}
    />
  );
}
