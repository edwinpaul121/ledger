export type MediaKind = "film" | "show" | "game" | "book";

const labels: Record<MediaKind, string> = {
  film: "Movie",
  show: "TV",
  game: "Game",
  book: "Book",
};

const colorClasses: Record<MediaKind, string> = {
  film: "bg-film/10 text-film",
  show: "bg-show/10 text-show",
  game: "bg-game/10 text-game",
  book: "bg-book/10 text-book",
};

export default function MediaTag({ kind }: { kind: MediaKind }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${colorClasses[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}
