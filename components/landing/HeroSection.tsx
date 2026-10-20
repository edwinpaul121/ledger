import MediaTag, { type MediaKind } from "./MediaTag";
import RatingStars from "./RatingStars";

const posters: {
  kind: MediaKind;
  title: string;
  year: string;
  cover: string;
  rotate: string;
  className: string;
}[] = [
  {
    kind: "game",
    title: "Elden Ring",
    year: "2022",
    cover: "https://picsum.photos/seed/elden-ring/360/460",
    rotate: "-rotate-12",
    className: "left-0 top-[60px] w-[180px] opacity-65",
  },
  {
    kind: "show",
    title: "Succession",
    year: "2023",
    cover: "https://picsum.photos/seed/succession/360/460",
    rotate: "rotate-8",
    className: "right-0 top-[60px] w-[180px] opacity-65",
  },
  {
    kind: "film",
    title: "Dune: Part Two",
    year: "2024",
    cover: "https://picsum.photos/seed/dune-part-two/360/460",
    rotate: "-rotate-4",
    className: "left-1/2 top-0 w-[240px] -translate-x-1/2",
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo/[0.06] to-transparent px-20 py-24">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 lg:flex-row">
        <div className="flex flex-1 flex-col items-start gap-7">
          <span className="rounded-full border border-indigo bg-indigo/[0.13] px-3 py-1.5 text-xs font-semibold uppercase text-paper">
            Now tracking: movies, TV, games &amp; books
          </span>
          <h1 className="font-display text-5xl leading-[1.15] text-paper lg:text-[64px] lg:leading-[1.1]">
            Your entire entertainment universe. In one elegant space.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-paper-dim">
            Stop scattering your culture across infinite tracking apps. Log your
            movies, rate your TV shows, and organize your gaming backlog in one
            cinematic companion.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/login"
              className="rounded-lg bg-mint px-8 py-4 text-base font-semibold text-ink transition-colors hover:bg-mint-bright"
            >
              Create Your Free Catalog
            </a>
            <a
              href="#trending"
              className="rounded-lg border-[1.5px] border-ink-line px-6 py-4 text-base font-semibold text-paper transition-colors hover:border-mint"
            >
              Explore Trends
            </a>
          </div>
        </div>

        <div className="relative h-[460px] w-full flex-1">
          {posters.map((p) => (
            <div
              key={p.title}
              className={`absolute flex flex-col gap-3 drop-shadow-[0_16px_16px_rgba(0,0,0,0.55)] ${p.rotate} ${p.className}`}
            >
              <div className="aspect-[2/3] w-full overflow-hidden rounded-xl border border-ink-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.cover} alt={p.title} className="size-full object-cover" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <MediaTag kind={p.kind} />
                  <span className="text-xs text-paper-faint">{p.year}</span>
                </div>
                <p className="truncate font-semibold text-paper">{p.title}</p>
                <RatingStars />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
