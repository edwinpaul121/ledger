function formatMoney(value: number | null): string | null {
  if (!value) return null;
  return `$${value.toLocaleString()}`;
}

function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetailsGrid({
  originalTitle,
  status,
  originalLanguage,
  runtime,
  budget,
  revenue,
  productionCompanies,
  spokenLanguages,
}: {
  originalTitle: string | null;
  status: string | null;
  originalLanguage: string | null;
  runtime: number | null;
  budget: number | null;
  revenue: number | null;
  productionCompanies: string | null;
  spokenLanguages: string | null;
}) {
  const fields = [
    { label: "Original Title", value: originalTitle },
    { label: "Status", value: status },
    { label: "Original Language", value: originalLanguage?.toUpperCase() },
    { label: "Runtime", value: formatRuntime(runtime) },
    { label: "Budget", value: formatMoney(budget) },
    { label: "Revenue", value: formatMoney(revenue) },
    { label: "Production", value: productionCompanies },
    { label: "Languages", value: spokenLanguages },
  ].filter((f) => f.value);

  if (fields.length === 0) return null;

  return (
    <section className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-ink-line pt-8 sm:grid-cols-3 md:grid-cols-4">
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
