"use client";

import { useEffect, useRef, useState } from "react";
import {
  Heart,
  BookmarkPlus,
  BookmarkCheck,
  PlayCircle,
  ListPlus,
  Check,
  CheckCircle2,
} from "lucide-react";

type Status = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | null;

type ListSummary = {
  id: string;
  name: string;
  items: { id: string; bookId: string | null }[];
};

export default function BookActions({
  bookId,
  signedIn,
  initialFavorite,
  initialStatus,
  initialProgressLabel,
  bookTitle,
}: {
  bookId: string;
  signedIn: boolean;
  initialFavorite: boolean;
  initialStatus: Status;
  initialProgressLabel: string | null;
  bookTitle: string;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [progressLabel, setProgressLabel] = useState(initialProgressLabel ?? "");
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

  async function track(body: Record<string, unknown>) {
    const res = await fetch(`/api/books/${bookId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  }

  async function setBookStatus(next: Status) {
    if (!signedIn) return (window.location.href = "/login");
    const prev = status;
    setStatus(next);
    if (!(await track({ status: next }))) {
      setStatus(prev);
      console.error("Failed to save status.");
    }
  }

  async function toggleFavorite() {
    if (!signedIn) return (window.location.href = "/login");
    const next = !favorite;
    setFavorite(next);
    if (!(await track({ favorite: next }))) {
      setFavorite(!next);
      console.error("Failed to save favorite.");
    }
  }

  async function saveProgress() {
    if (!signedIn) return;
    await track({ progressLabel: progressLabel.trim() || null });
  }

  function openListMenu() {
    if (!signedIn) return (window.location.href = "/login");
    setListMenuOpen((open) => !open);
  }

  async function addToList(listId: string) {
    const res = await fetch(`/api/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: bookTitle, mediaType: "BOOK", bookId }),
    });
    if (res.ok) {
      const item = await res.json();
      setLists((prev) =>
        prev ? prev.map((l) => (l.id === listId ? { ...l, items: [...l.items, item] } : l)) : prev
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
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
          onClick={() => setBookStatus(status === "PLANNED" ? null : "PLANNED")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
            status === "PLANNED"
              ? "border-mint bg-mint/10 text-mint"
              : "border-ink-line text-paper hover:border-mint hover:text-mint"
          }`}
        >
          {status === "PLANNED" ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <BookmarkPlus className="size-4" />
          )}
          {status === "PLANNED" ? "On Watchlist" : "Add to Watchlist"}
        </button>

        <button
          onClick={() => setBookStatus(status === "IN_PROGRESS" ? null : "IN_PROGRESS")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
            status === "IN_PROGRESS"
              ? "border-indigo bg-indigo/10 text-indigo"
              : "border-ink-line text-paper hover:border-indigo hover:text-indigo"
          }`}
        >
          <PlayCircle className="size-4" />
          {status === "IN_PROGRESS" ? "Reading" : "Start Reading"}
        </button>

        <button
          onClick={() => setBookStatus(status === "COMPLETED" ? null : "COMPLETED")}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
            status === "COMPLETED"
              ? "border-book bg-book/10 text-book"
              : "border-ink-line text-paper hover:border-book hover:text-book"
          }`}
        >
          <CheckCircle2 className="size-4" />
          {status === "COMPLETED" ? "Completed" : "Mark as Completed"}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={openListMenu}
            className="flex items-center gap-2 rounded-lg border border-ink-line px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:border-mint"
          >
            <ListPlus className="size-4" /> Add to List
            {lists && lists.filter((l) => l.items.some((i) => i.bookId === bookId)).length > 0 && (
              <span className="rounded-full bg-mint/20 px-1.5 py-0.5 text-[11px] text-mint">
                In {lists.filter((l) => l.items.some((i) => i.bookId === bookId)).length}
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
                  const added = list.items.some((item) => item.bookId === bookId);
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

      {status === "IN_PROGRESS" && (
        <div className="flex max-w-sm items-center gap-2">
          <input
            value={progressLabel}
            onChange={(e) => setProgressLabel(e.target.value)}
            onBlur={saveProgress}
            placeholder="Progress, e.g. Page 210 or Chapter 5"
            className="flex-1 rounded-lg border border-ink-line bg-ink-soft px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:border-mint"
          />
        </div>
      )}
    </div>
  );
}
