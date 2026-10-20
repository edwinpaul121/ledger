import ActivityFeedItem, { type ActivityItem } from "@/components/social/ActivityFeedItem";

const feed: ActivityItem[] = [
  {
    kind: "film",
    person: "Mia Vance",
    action: "logged & rated",
    title: "Challengers",
    quote:
      "The score was absolutely hypnotic. Best theater pacing I've felt all year — highly recommended.",
    avatar: "https://i.pravatar.cc/64?img=47",
    cover: "https://picsum.photos/seed/challengers-mini/140/200",
  },
  {
    kind: "game",
    person: "Marcus Aurelius",
    action: "completed backlog",
    title: "Hades II",
    quote:
      "Supergiant somehow captured lightning twice — the music, the roguelike loop, the story hooks.",
    avatar: "https://i.pravatar.cc/64?img=12",
    cover: "https://picsum.photos/seed/hades-mini/140/200",
  },
];

export default function SocialSection() {
  return (
    <section className="bg-ink-soft px-20 py-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 lg:flex-row">
        <div className="flex w-full max-w-md flex-col items-start gap-6">
          <span className="rounded-md bg-panel px-2.5 py-1 text-[11px] font-bold uppercase text-mint">
            Friend Activity
          </span>
          <h2 className="font-display text-4xl text-paper">
            Never watch or play alone again.
          </h2>
          <p className="leading-relaxed text-paper-dim">
            Follow your friends to see what they're diving into. Swap
            game-backlog lists, recommend movies, and discover shared
            obsessions in your home feed.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex">
              {[41, 22, 5].map((id, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={id}
                  src={`https://i.pravatar.cc/72?img=${id}`}
                  alt=""
                  className={`size-9 rounded-full border-2 border-ink-soft ${i > 0 ? "-ml-3" : ""}`}
                />
              ))}
            </div>
            <p className="text-sm text-paper-dim">+48 friends just logged new ratings</p>
          </div>
          <a href="/social" className="text-sm font-semibold text-mint hover:text-mint-bright">
            View full activity feed →
          </a>
        </div>

        <div className="flex flex-1 flex-col gap-5">
          {feed.map((item) => (
            <ActivityFeedItem key={item.title + item.person} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
