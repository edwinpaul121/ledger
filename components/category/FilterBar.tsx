"use client";

import { Search } from "lucide-react";
import type { SortKey } from "@/lib/catalog-query";

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
  { label: "New Releases", value: "new" },
  { label: "A–Z", value: "az" },
];

export default function FilterBar({
  sort,
  onSort,
  query,
  onQuery,
  placeholder,
}: {
  sort: SortKey;
  onSort: (s: SortKey) => void;
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1 rounded-[10px] bg-ink-soft p-1">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSort(option.value)}
            className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
              sort === option.value
                ? "border border-ink-line bg-panel text-mint"
                : "text-paper-dim hover:text-paper"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-ink-line bg-ink-soft py-2.5 pl-9 pr-3 text-sm text-paper placeholder:text-paper-faint focus:border-mint"
        />
      </div>
    </div>
  );
}
