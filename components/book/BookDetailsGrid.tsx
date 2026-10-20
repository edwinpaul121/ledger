export default function BookDetailsGrid({
  authors,
  firstPublishYear,
  subjects,
  ratingCount,
}: {
  authors: string | null;
  firstPublishYear: number | null;
  subjects: string | null;
  ratingCount: number | null;
}) {
  const fields = [
    { label: "Author", value: authors },
    { label: "First Published", value: firstPublishYear ? String(firstPublishYear) : null },
    { label: "Subjects", value: subjects },
    { label: "Ratings", value: ratingCount ? ratingCount.toLocaleString() : null },
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
