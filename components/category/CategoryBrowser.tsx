"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaKind } from "@/components/landing/MediaTag";
import type { SortKey } from "@/lib/catalog-query";
import FilterBar from "./FilterBar";
import MediaGrid, { type GridItem } from "./MediaGrid";

const typeMap: Record<MediaKind, string> = {
  film: "FILM",
  show: "SHOW",
  game: "GAME",
  book: "BOOK",
};

const noun: Record<MediaKind, string> = {
  film: "movies",
  show: "shows",
  game: "games",
  book: "books",
};

const PAGE = 20;

export default function CategoryBrowser({
  kind,
  initialItems,
  initialHasMore,
}: {
  kind: MediaKind;
  initialItems: GridItem[];
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>("popular");
  const [query, setQuery] = useState("");
  const [error, setError] = useState(false);
  const firstRun = useRef(true);
  const requestId = useRef(0); // ignore responses from outdated requests

  function url(skip: number) {
    const p = new URLSearchParams({
      type: typeMap[kind],
      sort,
      skip: String(skip),
      take: String(PAGE),
    });
    if (query.trim()) p.set("q", query.trim());
    return `/api/catalog?${p.toString()}`;
  }

  // Re-run from the top whenever the sort or search text changes (search is debounced).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(url(0));
        if (!res.ok) throw new Error("bad response");
        const data: { items: GridItem[]; hasMore: boolean } = await res.json();
        if (id !== requestId.current) return;
        setItems(data.items);
        setHasMore(data.hasMore);
      } catch {
        if (id === requestId.current) setError(true);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, query.trim() ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, query]);

  async function loadMore() {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch(url(items.length));
      if (!res.ok) throw new Error("bad response");
      const data: { items: GridItem[]; hasMore: boolean } = await res.json();
      if (id !== requestId.current) return;
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch {
      if (id === requestId.current) setHasMore(false);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  const searching = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      <FilterBar
        sort={sort}
        onSort={setSort}
        query={query}
        onQuery={setQuery}
        placeholder={`Search ${noun[kind]}…`}
      />

      {error ? (
        <p className="text-sm text-paper-faint">Couldn&apos;t load results. Try again.</p>
      ) : (
        <MediaGrid
          kind={kind}
          items={items}
          emptyMessage={
            searching
              ? `No ${noun[kind]} match “${query.trim()}”.`
              : `No ${noun[kind]} yet — the catalog import may still be running (see the README).`
          }
        />
      )}

      {hasMore && !error && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-ink-line px-6 py-3 text-sm font-semibold text-paper transition-colors hover:border-mint disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
