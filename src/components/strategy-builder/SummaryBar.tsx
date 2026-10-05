import type { StrategyResult } from '@/features/strategy-builder/types';
import { useCurrency } from '@/lib/currency-context';

const UNBOUNDED = 'Unlimited';

export function SummaryBar({ result }: { result: StrategyResult }) {
  const { money } = useCurrency();
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  const cells: { label: string; value: string; hint?: string; tone?: 'good' | 'warn' }[] = [
    {
      label: result.isCredit ? 'Net credit' : 'Net debit',
      value: money(Math.abs(result.netCashflow)),
      hint: result.isCredit ? 'Received at entry' : 'Paid at entry',
      tone: result.isCredit ? 'good' : undefined,
    },
    {
      label: 'Collateral',
      value: result.collateral === null ? 'Undefined' : money(result.collateral),
      hint: result.collateral === null ? 'Risk is unbounded' : 'Fully collateralised',
    },
    {
      label: 'Max loss',
      value: result.maxLoss === null ? UNBOUNDED : money(Math.abs(result.maxLoss)),
      tone: 'warn',
    },
    {
      label: 'Max profit',
      value: result.maxProfit === null ? UNBOUNDED : money(result.maxProfit),
      tone: 'good',
    },
    {
      label: 'Chance of profit',
      value: result.probabilityOfProfit === null ? '—' : pct(result.probabilityOfProfit),
      hint: 'Model estimate at expiry',
    },
    {
      label: result.breakevens.length > 1 ? 'Breakevens' : 'Breakeven',
      value: result.breakevens.length === 0 ? '—' : result.breakevens.map((b) => money(b)).join(' · '),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
      {cells.map((c) => (
        <div key={c.label} className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink/55">{c.label}</p>
          <p
            className={`mt-1 truncate font-heading text-lg font-semibold tabular-nums ${
              c.tone === 'warn' ? 'text-amber' : 'text-teal-dark'
            }`}
            title={c.value}
          >
            {c.value}
          </p>
          {c.hint ? <p className="text-[11px] text-ink/50">{c.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function GreeksRow({ result }: { result: StrategyResult }) {
  const { money } = useCurrency();
  const g = result.greeks;
  const items = [
    { k: 'Delta', v: g.delta.toFixed(1), hint: 'per 1 move in the underlying' },
    { k: 'Gamma', v: g.gamma.toFixed(2), hint: 'delta change per 1 move' },
    { k: 'Theta', v: money(g.theta), hint: 'per day' },
    { k: 'Vega', v: money(g.vega), hint: 'per 1 point of IV' },
    { k: 'Rho', v: money(g.rho), hint: 'per 1 point of rates' },
  ];
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="font-heading text-base font-semibold text-teal-dark">Position Greeks</h3>
      <p className="mt-0.5 text-xs text-ink/55">
        Net across every leg, today — already scaled by quantity and lot size.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {items.map((i) => (
          <div key={i.k} className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink/55">{i.k}</p>
            <p
              className={`font-heading text-base font-semibold tabular-nums ${
                i.v.startsWith('-') ? 'text-amber' : 'text-teal-dark'
              }`}
            >
              {i.v}
            </p>
            <p className="text-[11px] leading-tight text-ink/50">{i.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
