import type { MetricRow } from '@/features/options-calculator/metrics';

const TONE: Record<NonNullable<MetricRow['tone']>, string> = {
  neutral: 'text-teal-dark',
  good: 'text-teal-dark',
  warn: 'text-amber',
};

/** The four headline numbers. */
export function HeadlineCards({ rows }: { rows: MetricRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {rows.map((r) => (
        <div key={r.label} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/60">{r.label}</p>
          <p
            className={`mt-2 truncate font-heading text-2xl font-semibold tabular-nums ${
              TONE[r.tone ?? 'neutral']
            }`}
            title={r.value}
          >
            {r.value}
          </p>
          {r.hint ? <p className="mt-1 text-xs leading-snug text-ink/60">{r.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

/** The full breakdown, the part that replaces a spreadsheet's row of columns. */
export function DetailTable({ rows }: { rows: MetricRow[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-teal-dark">The numbers in full</h3>
      <dl className="mt-4 divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
            <dt className="text-sm text-ink/80">
              {r.label}
              {r.hint ? <span className="mt-0.5 block text-xs text-ink/55">{r.hint}</span> : null}
            </dt>
            <dd
              className={`font-heading text-base font-semibold tabular-nums ${TONE[r.tone ?? 'neutral']}`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
