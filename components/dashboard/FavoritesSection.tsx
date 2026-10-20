import Link from "next/link";
import { Heart } from "lucide-react";
import EntryListItem from "./EntryListItem";
import type { Entry } from "./types";

export default function FavoritesSection({
  entries,
  onUnfavorite,
}: {
  entries: Entry[];
  onUnfavorite: (id: string) => void;
}) {
  const recent = [...entries]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-paper">Favorites</h2>
        {entries.length > 0 && (
          <Link
            href="/dashboard/favorites"
            className="text-xs font-semibold text-mint hover:text-mint-bright"
          >
            View all →
          </Link>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-paper-faint">
          Nothing favorited yet — tap the heart on any title to add it here.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((entry) => (
            <EntryListItem
              key={entry.id}
              entry={entry}
              action={
                <button
                  onClick={() => onUnfavorite(entry.id)}
                  className="text-film transition-colors hover:text-film/70"
                  aria-label="Remove from favorites"
                >
                  <Heart className="size-4" fill="currentColor" />
                </button>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
