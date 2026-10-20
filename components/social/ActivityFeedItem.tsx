import MediaTag, { type MediaKind } from "@/components/landing/MediaTag";
import RatingStars from "@/components/landing/RatingStars";

export type ActivityItem = {
  kind: MediaKind;
  person: string;
  action: string;
  title: string;
  quote: string;
  avatar: string;
  cover: string;
};

export default function ActivityFeedItem({ item }: { item: ActivityItem }) {
  return (
    <div className="flex gap-5 rounded-2xl border border-ink-line bg-ink p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.cover}
        alt={item.title}
        className="h-[100px] w-[70px] shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.avatar} alt="" className="size-8 rounded-full" />
            <p className="text-sm">
              <span className="font-semibold text-paper">{item.person}</span>{" "}
              <span className="text-paper-dim">{item.action}</span>
            </p>
          </div>
          <MediaTag kind={item.kind} />
        </div>
        <div className="flex items-center gap-3">
          <p className="font-bold text-paper">{item.title}</p>
          <RatingStars size={12} />
        </div>
        <p className="text-sm leading-relaxed text-paper-dim">&ldquo;{item.quote}&rdquo;</p>
      </div>
    </div>
  );
}
