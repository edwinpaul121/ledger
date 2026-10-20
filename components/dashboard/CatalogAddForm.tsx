"use client";

import { useEffect, useState } from "react";
import type { MediaType } from "./types";

export type SearchResult = { id: string; title: string; year: number | null; posterPath: string | null };

const categories: { label: string; value: MediaType; available: boolean }[] = [
  { label: "Movies", value: "FILM", available: true },
  { label: "Shows", value: "SHOW", available: true },
  { label: "Games", value: "GAME", available: true },
  { label: "Books", value: "BOOK", available: true },
];

export default function CatalogAddForm({
  onSelect,
}: {
  onSelect: (mediaType: MediaType, result: SearchResult) => void;
}) {
  const [mediaType, setMediaType] = useState<MediaType>("FILM");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const available = categories.find((c) => c.value === mediaType)?.available ?? false;

  useEffect(() => {
    if (!available || !query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/catalog/search?type=${mediaType}&q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, mediaType, available]);

  function select(result: SearchResult) {
    onSelect(mediaType, result);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="flex flex-col gap-2 pt-1">
      <select
        value={mediaType}
        onChange={(e) => {
          setMediaType(e.target.value as MediaType);
          setQuery("");
          setResults([]);
        }}
        className="rounded-lg border border-ink-line bg-ink px-2 py-1.5 text-xs text-paper focus:border-mint"
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {available ? (
        <div className="relative">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for a ${
              mediaType === "SHOW"
                ? "show"
                : mediaType === "GAME"
                  ? "game"
                  : mediaType === "BOOK"
                    ? "book"
                    : "movie"
            }…`}
            className="w-full rounded-lg border border-ink-line bg-ink px-2 py-1.5 text-xs text-paper placeholder:text-paper-faint focus:border-mint"
          />
          {query.trim() && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-ink-line bg-ink-soft p-1 shadow-2xl">
              {loading ? (
                <p className="px-2 py-2 text-xs text-paper-faint">Searching…</p>
              ) : results.length === 0 ? (
                <p className="px-2 py-2 text-xs text-paper-faint">No matches in the catalog.</p>
              ) : (
                results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => select(r)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-paper hover:bg-panel"
                  >
                    {r.posterPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          mediaType === "GAME"
                            ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${r.posterPath}.jpg`
                            : mediaType === "BOOK"
                              ? `https://covers.openlibrary.org/b/id/${r.posterPath}-S.jpg`
                              : `https://image.tmdb.org/t/p/w92${r.posterPath}`
                        }
                        alt=""
                        className="h-9 w-6 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span className="h-9 w-6 shrink-0 rounded bg-ink" />
                    )}
                    <span className="truncate">
                      {r.title} {r.year && <span className="text-paper-faint">({r.year})</span>}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-lg border border-ink-line bg-ink px-2 py-2 text-xs text-paper-faint">
          Search isn&apos;t available for this category yet.
        </p>
      )}
    </div>
  );
}
