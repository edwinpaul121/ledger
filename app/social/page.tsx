import { Search } from "lucide-react";
import ActivityFeedItem, { type ActivityItem } from "@/components/social/ActivityFeedItem";
import FriendSuggestionCard from "@/components/social/FriendSuggestionCard";

const suggestions = [
  { name: "Priya Nair", mutual: "12 mutual friends", avatar: "https://i.pravatar.cc/80?img=32" },
  { name: "Tomas Reyes", mutual: "8 mutual friends", avatar: "https://i.pravatar.cc/80?img=15" },
  { name: "Yuki Tanaka", mutual: "5 mutual friends", avatar: "https://i.pravatar.cc/80?img=8" },
  { name: "Elena Popescu", mutual: "3 mutual friends", avatar: "https://i.pravatar.cc/80?img=44" },
];

const feed: ActivityItem[] = [
  {
    kind: "film",
    person: "Mia Vance",
    action: "logged & rated",
    title: "Challengers",
    quote: "The score was absolutely hypnotic. Best theater pacing I've felt all year.",
    avatar: "https://i.pravatar.cc/64?img=47",
    cover: "https://picsum.photos/seed/challengers-mini/140/200",
  },
  {
    kind: "game",
    person: "Marcus Aurelius",
    action: "completed backlog",
    title: "Hades II",
    quote: "Supergiant somehow captured lightning twice with the music and the roguelike loop.",
    avatar: "https://i.pravatar.cc/64?img=12",
    cover: "https://picsum.photos/seed/hades-mini/140/200",
  },
  {
    kind: "book",
    person: "Priya Nair",
    action: "finished reading",
    title: "Piranesi",
    quote: "Quietly devastating. The kind of book you want to reread the moment you close it.",
    avatar: "https://i.pravatar.cc/64?img=32",
    cover: "https://picsum.photos/seed/piranesi-mini/140/200",
  },
  {
    kind: "show",
    person: "Tomas Reyes",
    action: "started watching",
    title: "Shōgun",
    quote: "Three episodes in and I already know this is going to ruin my week.",
    avatar: "https://i.pravatar.cc/64?img=15",
    cover: "https://picsum.photos/seed/shogun-mini/140/200",
  },
];

export default function SocialPage() {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-14 px-6 py-14 md:px-20">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl text-paper md:text-5xl">Social</h1>
        <p className="max-w-xl text-lg text-paper-dim">
          Follow friends, see what they're into, and find your next recommendation.
        </p>
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-display text-2xl text-paper">Find friends</h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-faint" />
            <input
              type="text"
              placeholder="Search by name or email…"
              className="w-full rounded-lg border border-ink-line bg-ink-soft py-2.5 pl-9 pr-3 text-sm text-paper placeholder:text-paper-faint focus:border-mint"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((s) => (
            <FriendSuggestionCard key={s.name} {...s} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-2xl text-paper">Friend activity</h2>
        <div className="flex flex-col gap-4">
          {feed.map((item) => (
            <ActivityFeedItem key={item.title + item.person} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
