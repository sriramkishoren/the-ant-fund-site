import { useState } from 'react';
import type { BucketParams, WalkthroughYear } from '@/features/bucket-strategy/types';
import { formatMoney, formatMoneyCompact } from '@/features/bucket-strategy/money';

type Props = {
  walkthrough: WalkthroughYear[];
  params: BucketParams;
};

/**
 * Year-by-year walkthrough of a single deterministic "average return every
 * year" path. It won't match any Monte Carlo run, but it makes the plumbing
 * legible: expenses rising with inflation, each bucket earning, and the yearly
 * transfer that keeps the stability bucket topped up.
 */
export function WalkthroughTable({ walkthrough, params }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-2xl px-6 py-4 text-left focus-visible:outline-2 focus-visible:outline-teal"
      >
        <span>
          <span className="font-heading text-lg font-semibold text-teal-dark">
            Year-by-year walkthrough
          </span>
          <span className="mt-0.5 block text-xs text-ink/60">
            How the money flows between buckets, year by year
          </span>
        </span>
        <span className="flex flex-shrink-0 items-center gap-2 text-sm text-ink/60">
          {open ? 'Hide' : 'Show'}
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
        <div className="px-6 pb-6">
          <p className="mb-4 rounded-lg border border-border bg-cream/50 px-3 py-2 text-xs leading-relaxed text-ink/70">
            A smooth illustration: every year the growth bucket earns exactly your{' '}
            <span className="font-medium text-teal-dark">{params.equityReturnPct}%</span> expected
            return (no market swings), the stability bucket earns{' '}
            <span className="font-medium text-teal-dark">{params.fixedIncomeReturnPct}%</span>, and
            inflation is a steady{' '}
            <span className="font-medium text-teal-dark">{params.inflationPct}%</span> — so spending
            rises a little each year. Real Monte Carlo runs bounce around; this just shows the
            plumbing. Amounts are nominal (not inflation-adjusted).
          </p>

          <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-right text-xs tabular-nums">
              <thead className="sticky top-0 z-10 bg-cream text-[11px] uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Year
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Start<br />stability
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Start<br />growth
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Spending
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Net<br />withdrawal
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Market<br />gain
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Refill /<br />transfer
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    End<br />stability
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    End<br />growth
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {walkthrough.map((y) => (
                  <tr key={y.year} className="border-t border-border/60 even:bg-cream/40">
                    <td className="px-3 py-2 text-left font-medium text-teal-dark">
                      {y.year}
                      {y.cut ? (
                        <span
                          className="ml-1 rounded bg-amber/20 px-1 text-[10px] font-medium text-amber"
                          title="A guardrail spending cut fired this year"
                        >
                          cut
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-ink/80" title={formatMoney(y.startStability)}>
                      {formatMoneyCompact(y.startStability)}
                    </td>
                    <td className="px-3 py-2 text-ink/80" title={formatMoney(y.startGrowth)}>
                      {formatMoneyCompact(y.startGrowth)}
                    </td>
                    <td className="px-3 py-2 text-ink/80" title={formatMoney(y.spending)}>
                      {formatMoneyCompact(y.spending)}
                    </td>
                    <td className="px-3 py-2 text-ink/80" title={formatMoney(y.netWithdrawal)}>
                      −{formatMoneyCompact(y.netWithdrawal)}
                    </td>
                    <td className="px-3 py-2 text-teal-dark" title={formatMoney(y.marketGain)}>
                      +{formatMoneyCompact(y.marketGain)}
                    </td>
                    <td className="px-3 py-2">
                      <TransferCell transfer={y.transfer} />
                    </td>
                    <td className="px-3 py-2 text-ink/80" title={formatMoney(y.endStability)}>
                      {formatMoneyCompact(y.endStability)}
                    </td>
                    <td className="px-3 py-2 text-ink/80" title={formatMoney(y.endGrowth)}>
                      {formatMoneyCompact(y.endGrowth)}
                    </td>
                    <td
                      className="px-3 py-2 font-medium text-teal-dark"
                      title={formatMoney(y.endTotal)}
                    >
                      {formatMoneyCompact(y.endTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink/60">
            <span>
              <span className="font-medium text-teal">↑ stability</span> = sold growth to refill the
              safe bucket
            </span>
            <span>
              <span className="font-medium text-amber">↓ growth</span> = moved excess safe money back
              to stocks
            </span>
            <span>Hover any cell for the exact dollar amount.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TransferCell({ transfer }: { transfer: number }) {
  if (Math.abs(transfer) < 1) return <span className="text-ink/40">—</span>;
  if (transfer > 0) {
    return (
      <span className="text-teal" title="Sold growth to refill the stability bucket">
        ↑ {formatMoneyCompact(transfer)}
      </span>
    );
  }
  return (
    <span className="text-amber" title="Moved excess stability back to the growth bucket">
      ↓ {formatMoneyCompact(-transfer)}
    </span>
  );
}
