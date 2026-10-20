"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ListPlus } from "lucide-react";
import EntryListItem from "./EntryListItem";
import CatalogAddForm from "./CatalogAddForm";
import type { MediaList, MediaType, ListType } from "./types";

const TYPE_OPTIONS: { label: string; value: ListType }[] = [
  { label: "Mix", value: "MIX" },
  { label: "Movies", value: "FILM" },
  { label: "TV", value: "SHOW" },
  { label: "Games", value: "GAME" },
  { label: "Books", value: "BOOK" },
];

export default function CustomLists({
  lists,
  onCreateList,
  onAddItem,
}: {
  lists: MediaList[];
  onCreateList: (name: string, type: ListType) => void;
  onAddItem: (
    listId: string,
    title: string,
    mediaType?: MediaType,
    movieId?: string,
    showId?: string,
    gameId?: string,
    bookId?: string
  ) => void;
}) {
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<ListType>("MIX");
  const [openListId, setOpenListId] = useState<string | null>(null);

  function submitNewList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim(), newListType);
    setNewListName("");
    setNewListType("MIX");
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl text-paper">Your lists</h2>

      <form onSubmit={submitNewList} className="flex flex-wrap gap-2">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name, e.g. Neon Noir Essentials"
          className="min-w-[220px] flex-1 rounded-lg border border-ink-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-mint"
        />
        <select
          value={newListType}
          onChange={(e) => setNewListType(e.target.value as ListType)}
          className="rounded-lg border border-ink-line bg-ink-soft px-3 py-2.5 text-sm text-paper focus:border-mint"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mint-bright"
        >
          <ListPlus className="size-4" /> Create
        </button>
      </form>

      {lists.length === 0 ? (
        <p className="text-sm text-paper-faint">No custom lists yet — make your first one above.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((list) => {
            const open = openListId === list.id;
            const preview = list.items.slice(0, 4);
            return (
              <div key={list.id} className="rounded-2xl border border-ink-line bg-ink-soft p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-paper">{list.name}</h3>
                    <p className="text-xs text-paper-faint">
                      {list.type === "MIX" ? "Mixed" : list.type} · {list.items.length} items
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/lists/${list.id}`}
                    className="text-xs font-semibold text-mint hover:text-mint-bright"
                  >
                    View all →
                  </Link>
                </div>

                <div className="flex flex-col gap-2">
                  {preview.length === 0 ? (
                    <p className="text-sm text-paper-faint">Nothing added yet.</p>
                  ) : (
                    preview.map((item) => <EntryListItem key={item.id} entry={item} />)
                  )}
                </div>

                <button
                  onClick={() => setOpenListId(open ? null : list.id)}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-paper-dim transition-colors hover:text-paper"
                >
                  <Plus className="size-3.5" /> Add item
                </button>

                {open && (
                  <div className="mt-2">
                    <CatalogAddForm
                      onSelect={(mediaType, result) => {
                        onAddItem(
                          list.id,
                          result.title,
                          mediaType,
                          mediaType === "FILM" ? result.id : undefined,
                          mediaType === "SHOW" ? result.id : undefined,
                          mediaType === "GAME" ? result.id : undefined,
                          mediaType === "BOOK" ? result.id : undefined
                        );
                        setOpenListId(null);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
