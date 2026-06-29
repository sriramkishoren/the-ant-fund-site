import { useMemo, useState } from 'react';
import type { SimResult, YearlyDetailRow } from '@/features/monte-carlo/types';
import { formatCurrency } from '@/lib/format';

type PathKey = 'median' | 'p10' | 'p90';
const PAGE_SIZE = 12;

type Props = { result: SimResult };

const labels: Record<PathKey, string> = {
  median: 'Median path',
  p10: '10th percentile (bad case)',
  p90: '90th percentile (good case)',
};

export function YearByYearTable({ result }: Props) {
  const [path, setPath] = useState<PathKey>('median');
  const [page, setPage] = useState(0);

  const rows: YearlyDetailRow[] = useMemo(() => result.detailPaths[path], [result, path]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function selectPath(p: PathKey) {
    setPath(p);
    setPage(0);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">
          Year-by-year detail
        </h3>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Path to display">
          {(Object.keys(labels) as PathKey[]).map((p) => {
            const active = path === p;
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectPath(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-teal text-cream'
                    : 'border border-border text-teal-dark hover:bg-teal/5'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink/55">
              <th className="px-3 py-2 font-medium">Age</th>
              <th className="px-3 py-2 font-medium">Year</th>
              <th className="px-3 py-2 font-medium">Phase</th>
              <th className="px-3 py-2 text-right font-medium">Start</th>
              <th className="px-3 py-2 text-right font-medium">Cash flow</th>
              <th className="px-3 py-2 text-right font-medium">Growth</th>
              <th className="px-3 py-2 text-right font-medium">End</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.age} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 text-ink">{r.age}</td>
                <td className="px-3 py-2 text-ink/70">+{r.yearOffset}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      r.phase === 'accumulation'
                        ? 'bg-teal/10 text-teal-dark'
                        : 'bg-amber/10 text-amber'
                    }`}
                  >
                    {r.phase === 'accumulation' ? 'Saving' : 'Spending'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink">
                  {formatCurrency(r.startValue)}
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    r.cashflow >= 0 ? 'text-teal-dark' : 'text-amber'
                  }`}
                >
                  {r.cashflow >= 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(r.cashflow))}
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    r.growth >= 0 ? 'text-teal-dark' : 'text-amber'
                  }`}
                >
                  {r.growth >= 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(r.growth))}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-teal-dark">
                  {formatCurrency(r.endValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink/65">
        <span>
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} of{' '}
          {rows.length} years
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-border px-2 py-1 text-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-border px-2 py-1 text-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
