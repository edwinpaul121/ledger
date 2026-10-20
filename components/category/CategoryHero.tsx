import type { MediaKind } from "@/components/landing/MediaTag";

const dotClass: Record<MediaKind, string> = {
  film: "bg-film",
  show: "bg-show",
  game: "bg-game",
  book: "bg-book",
};

export default function CategoryHero({
  kind,
  title,
  description,
  stats,
}: {
  kind: MediaKind;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <section className="border-b border-ink-line px-6 py-14 md:px-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClass[kind]}`} />
          <span className="text-xs font-bold uppercase tracking-wide text-paper-dim">
            {kind === "film" ? "Movies" : kind === "show" ? "TV" : kind === "game" ? "Games" : "Books"}
          </span>
        </div>

        <div className="flex flex-col gap-4 md:max-w-2xl">
          <h1 className="font-display text-4xl text-paper md:text-5xl">{title}</h1>
          <p className="text-lg leading-relaxed text-paper-dim">{description}</p>
        </div>

        <div className="flex flex-wrap gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-display text-2xl text-paper">{stat.value}</span>
              <span className="text-xs text-paper-faint">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
