import { useState } from 'react';
import type { InvestmentResult } from '@/features/investment-calculator/types';
import { formatCurrency } from '@/lib/format';

type Props = {
  result: InvestmentResult;
};

export function YearTable({ result }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-2xl px-6 py-4 text-left focus-visible:outline-2 focus-visible:outline-teal"
      >
        <span className="font-heading text-lg font-semibold text-teal-dark">
          Year-by-year breakdown
        </span>
        <span className="flex items-center gap-2 text-sm text-ink/60">
          {open ? 'Hide' : 'Show'} {result.years.length} years
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="max-h-96 overflow-auto border-t border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-cream text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Year
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Start balance
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Contributions
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  Interest
                </th>
                <th scope="col" className="px-4 py-2 text-right font-medium">
                  End balance
                </th>
              </tr>
            </thead>
            <tbody>
              {result.years.map((y) => (
                <tr key={y.year} className="border-t border-border/60 even:bg-cream/40">
                  <td className="px-4 py-2 text-ink/80">{y.year}</td>
                  <td className="px-4 py-2 text-right text-ink/80">
                    {formatCurrency(y.startBalance)}
                  </td>
                  <td className="px-4 py-2 text-right text-teal-dark">
                    {formatCurrency(y.contributions)}
                  </td>
                  <td className="px-4 py-2 text-right text-amber">{formatCurrency(y.interest)}</td>
                  <td className="px-4 py-2 text-right font-medium text-teal-dark">
                    {formatCurrency(y.endBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
