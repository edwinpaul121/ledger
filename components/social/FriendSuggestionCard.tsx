"use client";

import { useState } from "react";
import { UserPlus, Check } from "lucide-react";

export default function FriendSuggestionCard({
  name,
  mutual,
  avatar,
}: {
  name: string;
  mutual: string;
  avatar: string;
}) {
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-line bg-ink-soft p-4">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt="" className="size-10 rounded-full" />
        <div>
          <p className="text-sm font-semibold text-paper">{name}</p>
          <p className="text-xs text-paper-faint">{mutual}</p>
        </div>
      </div>
      <button
        onClick={() => setAdded(true)}
        disabled={added}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          added
            ? "border border-ink-line text-paper-faint"
            : "bg-mint text-ink hover:bg-mint-bright"
        }`}
      >
        {added ? (
          <>
            <Check className="size-3.5" /> Added
          </>
        ) : (
          <>
            <UserPlus className="size-3.5" /> Add
          </>
        )}
      </button>
    </div>
  );
}
