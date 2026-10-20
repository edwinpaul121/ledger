import { CheckCircle2 } from "lucide-react";

const lists = [
  {
    title: "Essential Neon Noir",
    description: "Rain-slicked asphalt, synthesizer scores, and high-tech-low-life vibes.",
    cover: "https://picsum.photos/seed/neon-noir/440/510",
    items: ["Blade Runner 2049", "Cyberpunk 2077", "Drive", "Katana Zero"],
  },
  {
    title: "Mind-Bending Narrative",
    description: "Stories that challenge your perception of reality and timeline structure.",
    cover: "https://picsum.photos/seed/mind-bending/440/510",
    items: ["Severance", "Inception", "Outer Wilds", "Coherence"],
  },
];

export default function CuratedListsSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-20 py-20">
      <div className="mb-10">
        <h2 className="font-display text-4xl text-paper">Curated Lists</h2>
        <p className="mt-3 text-paper-dim">
          Create, share, and discover custom stacks of mixed media.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {lists.map((list) => (
          <div
            key={list.title}
            className="flex overflow-hidden rounded-2xl border border-ink-line bg-ink-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={list.cover}
              alt={list.title}
              className="hidden w-[220px] shrink-0 object-cover sm:block"
            />
            <div className="flex flex-1 flex-col gap-4 p-8">
              <div>
                <h3 className="font-display text-2xl text-paper">{list.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper-dim">{list.description}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {list.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-paper">
                    <CheckCircle2 className="size-3.5 shrink-0 text-mint" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
