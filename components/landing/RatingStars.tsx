import { Star } from "lucide-react";

export default function RatingStars({
  filled = 5,
  size = 14,
}: {
  filled?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i < filled ? "fill-mint text-mint" : "fill-ink-line text-ink-line"}
        />
      ))}
    </div>
  );
}
