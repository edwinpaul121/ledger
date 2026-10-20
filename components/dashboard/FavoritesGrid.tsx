"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import EntryListItem from "@/components/dashboard/EntryListItem";
import type { Entry } from "@/components/dashboard/types";

export default function FavoritesGrid({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState(initialEntries);

  async function unfavorite(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: false }),
    });
  }

  if (entries.length === 0) {
    return <p className="text-sm text-paper-faint">Nothing favorited yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <EntryListItem
          key={entry.id}
          entry={entry}
          action={
            <button
              onClick={() => unfavorite(entry.id)}
              className="text-film transition-colors hover:text-film/70"
              aria-label="Remove from favorites"
            >
              <Heart className="size-4" fill="currentColor" />
            </button>
          }
        />
      ))}
    </div>
  );
}
