"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, BookmarkPlus, BookmarkCheck, ListPlus, Check } from "lucide-react";

type ListSummary = {
  id: string;
  name: string;
  items: { id: string; showId: string | null }[];
};

export default function ShowActions({
  showId,
  signedIn,
  initialFavorite,
  initialOnWatchlist,
  showTitle,
}: {
  showId: string;
  signedIn: boolean;
  initialFavorite: boolean;
  initialOnWatchlist: boolean;
  showTitle: string;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [onWatchlist, setOnWatchlist] = useState(initialOnWatchlist);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [lists, setLists] = useState<ListSummary[] | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/lists")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setLists(data));
  }, [signedIn]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setListMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggleFavorite() {
    if (!signedIn) return (window.location.href = "/login");
    const next = !favorite;
    setFavorite(next);
    const res = await fetch(`/api/shows/${showId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: next }),
    });
    if (!res.ok) {
      setFavorite(!next);
      console.error("Failed to save favorite.");
    }
  }

  async function toggleWatchlist() {
    if (!signedIn) return (window.location.href = "/login");
    const next = !onWatchlist;
    setOnWatchlist(next);
    const res = await fetch(`/api/shows/${showId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next ? "PLANNED" : null }),
    });
    if (!res.ok) {
      setOnWatchlist(!next);
      console.error("Failed to save watchlist state.");
    }
  }

  function openListMenu() {
    if (!signedIn) return (window.location.href = "/login");
    setListMenuOpen((open) => !open);
  }

  async function addToList(listId: string) {
    const res = await fetch(`/api/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: showTitle, mediaType: "SHOW", showId }),
    });
    if (res.ok) {
      const item = await res.json();
      setLists((prev) =>
        prev ? prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, item] } : l)) : prev
      );
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={toggleFavorite}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
          favorite
            ? "border-film bg-film/10 text-film"
            : "border-ink-line text-paper hover:border-film hover:text-film"
        }`}
      >
        <Heart className="size-4" fill={favorite ? "currentColor" : "none"} />
        {favorite ? "Favorited" : "Favorite"}
      </button>

      <button
        onClick={toggleWatchlist}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
          onWatchlist
            ? "border-mint bg-mint/10 text-mint"
            : "border-ink-line text-paper hover:border-mint hover:text-mint"
        }`}
      >
        {onWatchlist ? <BookmarkCheck className="size-4" /> : <BookmarkPlus className="size-4" />}
        {onWatchlist ? "On Watchlist" : "Add to Watchlist"}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={openListMenu}
          className="flex items-center gap-2 rounded-lg border border-ink-line px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:border-mint"
        >
          <ListPlus className="size-4" /> Add to List
          {lists && lists.filter((l) => l.items.some((i) => i.showId === showId)).length > 0 && (
            <span className="rounded-full bg-mint/20 px-1.5 py-0.5 text-[11px] text-mint">
              In {lists.filter((l) => l.items.some((i) => i.showId === showId)).length}
            </span>
          )}
        </button>

        {listMenuOpen && (
          <div className="absolute left-0 top-full z-10 mt-2 w-56 rounded-xl border border-ink-line bg-ink-soft p-2 shadow-2xl">
            {lists === null ? (
              <p className="px-3 py-2 text-xs text-paper-faint">Loading…</p>
            ) : lists.length === 0 ? (
              <p className="px-3 py-2 text-xs text-paper-faint">
                No lists yet — create one from your dashboard.
              </p>
            ) : (
              lists.map((list) => {
                const added = list.items.some((item) => item.showId === showId);
                return (
                  <button
                    key={list.id}
                    onClick={() => !added && addToList(list.id)}
                    disabled={added}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-paper hover:bg-panel disabled:cursor-default disabled:opacity-70"
                  >
                    {list.name}
                    {added && (
                      <span className="flex items-center gap-1 text-xs text-mint">
                        <Check className="size-3.5" /> Added
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
