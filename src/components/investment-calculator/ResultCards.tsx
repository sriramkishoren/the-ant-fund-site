import type { InvestmentResult } from '@/features/investment-calculator/types';
import { formatCurrency } from '@/lib/format';

type Props = {
  result: InvestmentResult;
};

export function ResultCards({ result }: Props) {
  const invested = result.startingAmount + result.totalContributions;
  const growthShare = result.endBalance > 0 ? result.totalInterest / result.endBalance : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 to-gold/10 p-6 shadow-sm sm:col-span-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal">End balance</p>
        <p className="mt-1 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
          {formatCurrency(result.endBalance)}
        </p>
        <p className="mt-2 text-sm text-ink/70">
          {formatCurrency(invested)} invested grows into{' '}
          {formatCurrency(result.endBalance)} —{' '}
          <span className="font-medium text-teal-dark">
            {(growthShare * 100).toFixed(0)}% of it is growth
          </span>
          .
        </p>
      </div>

      <Stat label="Starting amount" value={result.startingAmount} tone="ink" />
      <Stat label="Total contributions" value={result.totalContributions} tone="teal" />
      <Stat label="Total interest earned" value={result.totalInterest} tone="amber" />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'ink' | 'teal' | 'amber';
}) {
  const dot =
    tone === 'teal' ? 'bg-teal' : tone === 'amber' ? 'bg-amber' : 'bg-teal-dark';
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <p className="text-xs font-medium uppercase tracking-wide text-ink/60">{label}</p>
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold text-teal-dark">
        {formatCurrency(value)}
      </p>
    </div>
  );
}
