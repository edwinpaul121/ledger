function formatMinutes(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  return `${h}h`;
}

export default function GameDetailsGrid({
  platforms,
  developer,
  publisher,
  gameModes,
  timeToBeatMainMinutes,
  timeToBeatCompleteMinutes,
}: {
  platforms: string | null;
  developer: string | null;
  publisher: string | null;
  gameModes: string | null;
  timeToBeatMainMinutes: number | null;
  timeToBeatCompleteMinutes: number | null;
}) {
  const fields = [
    { label: "Platforms", value: platforms },
    { label: "Developer", value: developer },
    { label: "Publisher", value: publisher },
    { label: "Game Modes", value: gameModes },
    { label: "Time to Beat (Main Story)", value: formatMinutes(timeToBeatMainMinutes) },
    { label: "Time to Beat (Completionist)", value: formatMinutes(timeToBeatCompleteMinutes) },
  ].filter((f) => f.value);

  if (fields.length === 0) return null;

  return (
    <section className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-ink-line pt-8 sm:grid-cols-3">
      {fields.map((field) => (
        <div key={field.label} className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-paper-faint">
            {field.label}
          </span>
          <span className="text-sm text-paper">{field.value}</span>
        </div>
      ))}
    </section>
  );
}
