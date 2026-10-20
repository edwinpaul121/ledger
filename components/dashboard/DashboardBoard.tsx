"use client";

import { useState } from "react";
import StatusColumn from "./StatusColumn";
import RecentlyViewed from "./RecentlyViewed";
import CustomLists from "./CustomLists";
import FavoritesSection from "./FavoritesSection";
import type { Entry, MediaList, MediaType, ViewHistoryEntry } from "./types";

export default function DashboardBoard({
  initialEntries,
  initialLists,
  initialViewHistory,
}: {
  initialEntries: Entry[];
  initialLists: MediaList[];
  initialViewHistory: ViewHistoryEntry[];
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [lists, setLists] = useState<MediaList[]>(initialLists);

  async function addFromCatalog(mediaType: MediaType, id: string, status: Entry["status"]) {
    const endpoint =
      mediaType === "SHOW"
        ? `/api/shows/${id}/track`
        : mediaType === "GAME"
          ? `/api/games/${id}/track`
          : mediaType === "BOOK"
            ? `/api/books/${id}/track`
            : `/api/movies/${id}/track`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const entry: Entry = await res.json();
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev];
    });
  }

  async function updateEntry(
    id: string,
    patch: Partial<Pick<Entry, "status" | "progressLabel" | "rating" | "favorite">>
  ) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    await fetch(`/api/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function createList(name: string, type: MediaList["type"]) {
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });
    if (res.ok) {
      const list = await res.json();
      setLists((prev) => [list, ...prev]);
    }
  }

  async function addListItem(
    listId: string,
    title: string,
    mediaType?: MediaType,
    movieId?: string,
    showId?: string,
    gameId?: string,
    bookId?: string
  ) {
    const res = await fetch(`/api/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, mediaType, movieId, showId, gameId, bookId }),
    });
    if (res.ok) {
      const item = await res.json();
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, item] } : l))
      );
    }
  }

  const favoriteEntries = entries.filter((e) => e.favorite);

  return (
    <div className="flex flex-col gap-14">
      <FavoritesSection
        entries={favoriteEntries}
        onUnfavorite={(id) => updateEntry(id, { favorite: false })}
      />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl text-paper">Your Library</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <StatusColumn
            status="PLANNED"
            entries={entries.filter((e) => e.status === "PLANNED")}
            onAdd={(mediaType, result) => addFromCatalog(mediaType, result.id, "PLANNED")}
          />
          <StatusColumn
            status="IN_PROGRESS"
            entries={entries.filter((e) => e.status === "IN_PROGRESS")}
            onAdd={(mediaType, result) => addFromCatalog(mediaType, result.id, "IN_PROGRESS")}
          />
          <StatusColumn
            status="COMPLETED"
            entries={entries.filter((e) => e.status === "COMPLETED")}
            onAdd={(mediaType, result) => addFromCatalog(mediaType, result.id, "COMPLETED")}
          />
        </div>
      </section>

      <RecentlyViewed entries={initialViewHistory} />

      <CustomLists lists={lists} onCreateList={createList} onAddItem={addListItem} />
    </div>
  );
}
