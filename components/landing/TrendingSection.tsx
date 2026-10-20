"use client";

import { useState } from "react";
import MediaTag, { type MediaKind } from "./MediaTag";
import RatingStars from "./RatingStars";

const items: { kind: MediaKind; title: string; year: string; cover: string }[] = [
  { kind: "game", title: "Cyberpunk 2077", year: "2020", cover: "https://picsum.photos/seed/cyberpunk-2077/400/580" },
  { kind: "film", title: "Oppenheimer", year: "2023", cover: "https://picsum.photos/seed/oppenheimer/400/580" },
  { kind: "show", title: "Severance", year: "2022", cover: "https://picsum.photos/seed/severance/400/580" },
  { kind: "film", title: "Challengers", year: "2024", cover: "https://picsum.photos/seed/challengers/400/580" },
];

const tabs: { label: string; kind: MediaKind | "all" }[] = [
  { label: "All", kind: "all" },
  { label: "Movies", kind: "film" },
  { label: "TV", kind: "show" },
  { label: "Games", kind: "game" },
];

export default function TrendingSection() {
  const [active, setActive] = useState<MediaKind | "all">("all");
  const visible = active === "all" ? items : items.filter((i) => i.kind === active);

  return (
    <section id="trending" className="mx-auto max-w-[1440px] px-20 py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-4xl text-paper">Trending Across Media</h2>
          <p className="mt-3 text-paper-dim">What the community is logging and debating right now.</p>
        </div>
        <div className="flex gap-1 rounded-[10px] bg-ink-soft p-1">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActive(tab.kind)}
              className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
                active === tab.kind
                  ? "border border-ink-line bg-panel text-mint"
                  : "text-paper-dim hover:text-paper"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((item) => (
          <div key={item.title} className="flex flex-col gap-3">
            <div className="aspect-[280/406] w-full overflow-hidden rounded-xl border border-ink-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.cover} alt={item.title} className="size-full object-cover" />
            </div>
            <div className="flex items-center justify-between">
              <MediaTag kind={item.kind} />
              <span className="text-xs text-paper-faint">{item.year}</span>
            </div>
            <p className="truncate font-semibold text-paper">{item.title}</p>
            <RatingStars />
          </div>
        ))}
      </div>
    </section>
  );
}
