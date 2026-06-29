import type { SimResult } from '@/features/monte-carlo/types';
import { formatCurrency, formatPercent } from '@/lib/format';

type Props = { result: SimResult };

export function SummaryCards({ result }: Props) {
  const items = [
    {
      label: 'Success rate',
      value: formatPercent(result.successRate),
      sub: `${result.meta.runs.toLocaleString()} runs`,
      accent: 'text-teal-dark',
    },
    {
      label: 'Median terminal value',
      value: formatCurrency(result.medianTerminal),
      sub: 'at life expectancy',
      accent: 'text-teal-dark',
    },
    {
      label: '10th percentile',
      value: formatCurrency(result.p10Terminal),
      sub: 'bad-case outcome',
      accent: 'text-teal-dark',
    },
    {
      label: '90th percentile',
      value: formatCurrency(result.p90Terminal),
      sub: 'good-case outcome',
      accent: 'text-teal-dark',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-ink/55">
            {it.label}
          </div>
          <div className={`mt-2 font-heading text-2xl font-semibold ${it.accent}`}>
            {it.value}
          </div>
          <div className="mt-1 text-xs text-ink/55">{it.sub}</div>
        </div>
      ))}
      {result.medianDepletionAge !== null ? (
        <div className="col-span-2 rounded-xl border border-amber/60 bg-amber/5 p-4 lg:col-span-4">
          <div className="text-xs font-medium uppercase tracking-wide text-amber">
            Median depletion age (among failed runs)
          </div>
          <div className="mt-1 font-heading text-xl font-semibold text-teal-dark">
            Age {Math.round(result.medianDepletionAge)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
