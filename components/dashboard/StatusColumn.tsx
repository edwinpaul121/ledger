"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import EntryListItem from "./EntryListItem";
import CatalogAddForm, { type SearchResult } from "./CatalogAddForm";
import type { Entry, EntryStatus, MediaType } from "./types";

const STATUS_META: Record<string, { label: string; slug: string }> = {
  PLANNED: { label: "Backlog", slug: "backlog" },
  IN_PROGRESS: { label: "Currently Tracking", slug: "tracking" },
  COMPLETED: { label: "Completed", slug: "completed" },
};

const FILTERS: { label: string; value: MediaType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Movies", value: "FILM" },
  { label: "Shows", value: "SHOW" },
  { label: "Games", value: "GAME" },
  { label: "Books", value: "BOOK" },
];

export default function StatusColumn({
  status,
  entries,
  onAdd,
}: {
  status: EntryStatus;
  entries: Entry[];
  onAdd: (mediaType: MediaType, result: SearchResult) => void;
}) {
  const meta = STATUS_META[status];
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<MediaType | "ALL">("ALL");

  const filtered = filter === "ALL" ? entries : entries.filter((e) => e.mediaType === filter);
  const recent = [...filtered]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-line bg-ink-soft p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-paper">{meta.label}</h3>
        <span className="text-xs text-paper-faint">{filtered.length}</span>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-ink p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              filter === f.value ? "bg-panel text-mint" : "text-paper-dim hover:text-paper"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {recent.length === 0 ? (
          <p className="text-sm text-paper-faint">Nothing here yet.</p>
        ) : (
          recent.map((entry) => (
            <EntryListItem key={entry.id} entry={entry} meta={entry.progressLabel ?? undefined} />
          ))
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="flex items-center gap-1 text-xs font-semibold text-paper-dim transition-colors hover:text-paper"
        >
          <Plus className="size-3.5" /> Quick add
        </button>
        <Link
          href={`/dashboard/${meta.slug}`}
          className="text-xs font-semibold text-mint hover:text-mint-bright"
        >
          View all →
        </Link>
      </div>

      {showAdd && (
        <CatalogAddForm
          onSelect={(mediaType, result) => {
            onAdd(mediaType, result);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
