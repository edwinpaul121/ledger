"use client";

import { useState } from "react";
import EntryListItem from "@/components/dashboard/EntryListItem";
import type { ListItem, MediaType } from "@/components/dashboard/types";

const FILTERS: { label: string; value: MediaType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Movies", value: "FILM" },
  { label: "Shows", value: "SHOW" },
  { label: "Games", value: "GAME" },
  { label: "Books", value: "BOOK" },
];

export default function ListDetailView({ items }: { items: ListItem[] }) {
  const [filter, setFilter] = useState<MediaType | "ALL">("ALL");
  const visible = filter === "ALL" ? items : items.filter((i) => i.mediaType === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1 rounded-[10px] bg-ink-soft p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
              filter === f.value
                ? "border border-ink-line bg-panel text-mint"
                : "text-paper-dim hover:text-paper"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-paper-faint">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((item) => (
            <EntryListItem key={item.id} entry={item} />
          ))}
        </div>
      )}
    </div>
  );
}
