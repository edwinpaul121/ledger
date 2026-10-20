export default function CtaSection() {
  return (
    <section className="px-20 py-24">
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-8 overflow-hidden rounded-3xl border border-ink-line bg-gradient-to-br from-indigo/20 via-ink to-mint/10 p-16 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <h2 className="font-display text-3xl text-paper sm:text-[44px]">
            Start tracking your next obsession.
          </h2>
          <p className="leading-relaxed text-paper-dim">
            Join film buffs, binge-watchers, and power gamers cataloging their
            favorites. Import your data from other trackers with a single click.
          </p>
        </div>

        <form className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 rounded-lg border-[1.5px] border-ink-line bg-ink px-5 py-3.5 text-[15px] text-paper placeholder:text-paper-faint focus:border-mint"
          />
          <button
            type="submit"
            className="rounded-lg bg-mint px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-mint-bright"
          >
            Get Started
          </button>
        </form>

        <p className="text-[13px] text-paper-faint">
          Free forever. Sync instantly with Letterboxd, IMDb, or Steam.
        </p>
      </div>
    </section>
  );
}
