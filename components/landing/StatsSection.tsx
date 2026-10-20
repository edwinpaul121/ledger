import { Clock, Gamepad2, BarChart3 } from "lucide-react";

const ratingBars = [
  { label: "5 Stars", count: "48 reviews", width: "100%", color: "bg-mint" },
  { label: "4 Stars", count: "36 reviews", width: "80%", color: "bg-indigo" },
  { label: "3 Stars", count: "18 reviews", width: "40%", color: "bg-paper-dim" },
];

export default function StatsSection() {
  return (
    <section className="bg-ink px-20 py-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-4xl text-paper">Your Culture Dashboard</h2>
            <p className="mt-3 text-paper-dim">
              Watch your personal statistics evolve with every log and backlog update.
            </p>
          </div>
          <a
            href="/login"
            className="rounded-lg border border-ink-line px-5 py-2.5 text-sm text-paper transition-colors hover:border-mint"
          >
            View Full Dashboard
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-5 rounded-2xl border border-ink-line bg-ink-soft p-7">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold uppercase text-paper-dim">Time Logged</p>
              <Clock className="size-5 text-paper-dim" />
            </div>
            <div>
              <p className="font-display text-4xl text-paper">342 hrs</p>
              <p className="mt-1 text-sm text-paper-faint">120 movies &amp; 48 TV episodes</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-ink-line bg-ink-soft p-7">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold uppercase text-paper-dim">Gaming Backlog</p>
              <Gamepad2 className="size-5 text-paper-dim" />
            </div>
            <div>
              <p className="font-display text-4xl text-paper">45 Games</p>
              <p className="mt-1 text-sm text-paper-faint">15 in progress, 30 unplayed</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-ink-line bg-ink-soft p-7">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold uppercase text-paper-dim">Ratings Given</p>
              <BarChart3 className="size-5 text-paper-dim" />
            </div>
            <div className="flex flex-col gap-2">
              {ratingBars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-2">
                  <span className="w-12 text-xs text-paper-dim">{bar.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-line">
                    <div className={`h-full ${bar.color}`} style={{ width: bar.width }} />
                  </div>
                  <span className="w-16 text-right text-xs text-paper-faint">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
