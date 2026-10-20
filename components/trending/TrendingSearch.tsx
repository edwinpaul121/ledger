"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import type { MediaKind } from "@/components/landing/MediaTag";
import type { TrendingItem } from "@/lib/trending";
import TrendingRow from "./TrendingRow";

const KINDS: { kind: MediaKind; type: string }[] = [
  { kind: "film", type: "FILM" },
  { kind: "show", type: "SHOW" },
  { kind: "game", type: "GAME" },
  { kind: "book", type: "BOOK" },
];

type Results = Record<MediaKind, TrendingItem[]>;

/**
 * Search box for the Trending page. Empty -> shows the normal trending rows
 * (`children`). Typing -> searches movies, shows, games and books at once.
 */
export default function TrendingSearch({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  const q = query.trim();

  useEffect(() => {
    if (!q) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const entries = await Promise.all(
        KINDS.map(async ({ kind, type }) => {
          try {
            const res = await fetch(`/api/catalog?type=${type}&q=${encodeURIComponent(q)}&take=12`);
            const data: { items: TrendingItem[] } = res.ok ? await res.json() : { items: [] };
            return [kind, data.items] as const;
          } catch {
            return [kind, [] as TrendingItem[]] as const;
          }
        })
      );
      if (cancelled) return;
      setResults(Object.fromEntries(entries) as Results);
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  const total = results ? KINDS.reduce((n, { kind }) => n + results[kind].length, 0) : 0;

  return (
    <>
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-paper-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, games and books…"
          className="w-full rounded-xl border border-ink-line bg-ink-soft py-3 pl-11 pr-4 text-sm text-paper placeholder:text-paper-faint focus:border-mint"
        />
      </div>

      {!q ? (
        children
      ) : loading && !results ? (
        <p className="text-sm text-paper-faint">Searching…</p>
      ) : total === 0 ? (
        <p className="text-sm text-paper-faint">No matches for “{q}”.</p>
      ) : (
        results &&
        KINDS.map(({ kind }) =>
          results[kind].length > 0 ? (
            <TrendingRow key={kind} kind={kind} items={results[kind]} title="Results in" />
          ) : null
        )
      )}
    </>
  );
}
