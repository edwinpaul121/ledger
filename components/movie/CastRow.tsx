"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type CastMember = { name: string; character: string; profilePath: string | null };
type CrewMember = { name: string; job: string; profilePath: string | null };

export default function CastRow({ cast, crew }: { cast: CastMember[]; crew: CrewMember[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!cast || cast.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 border-t border-ink-line pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-paper">Cast</h2>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 text-sm font-semibold text-paper-dim transition-colors hover:text-mint"
        >
          {expanded ? "Hide full cast & crew" : "View full cast & crew"}
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-2">
        {cast.slice(0, 10).map((member) => (
          <div key={member.name} className="flex w-[130px] shrink-0 flex-col gap-2">
            <div className="aspect-square w-full overflow-hidden rounded-full border border-ink-line bg-ink-soft">
              {member.profilePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://image.tmdb.org/t/p/w185${member.profilePath}`}
                  alt={member.name}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="text-center">
              <p className="truncate text-sm font-semibold text-paper">{member.name}</p>
              <p className="truncate text-xs text-paper-faint">{member.character}</p>
            </div>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="grid gap-8 rounded-xl border border-ink-line bg-ink-soft p-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-paper-faint">
              Full Cast
            </p>
            <ul className="flex flex-col gap-1.5">
              {cast.map((member) => (
                <li key={member.name} className="flex justify-between gap-3 text-sm">
                  <span className="text-paper">{member.name}</span>
                  <span className="truncate text-paper-faint">{member.character}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-paper-faint">Crew</p>
            {crew.length === 0 ? (
              <p className="text-sm text-paper-faint">No crew details available.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {crew.map((member) => (
                  <li key={member.name + member.job} className="flex justify-between gap-3 text-sm">
                    <span className="text-paper">{member.name}</span>
                    <span className="text-paper-faint">{member.job}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
