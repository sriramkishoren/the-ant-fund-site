import type { SimulationResult } from '@/features/bucket-strategy/types';
import { formatMoney, formatMoneyCompact } from '@/features/bucket-strategy/money';

type Props = {
  result: SimulationResult;
  totalPortfolio: number;
};

export function AllocationCards({ result, totalPortfolio }: Props) {
  const stabilityPct = totalPortfolio > 0 ? (result.initialStability / totalPortfolio) * 100 : 0;
  const growthPct = totalPortfolio > 0 ? (result.initialGrowth / totalPortfolio) * 100 : 0;
  const successTone =
    result.successRate >= 0.9 ? 'text-teal-dark' : result.successRate >= 0.75 ? 'text-amber' : 'text-red-600';

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        label="Stability bucket"
        value={formatMoneyCompact(result.initialStability)}
        exact={formatMoney(result.initialStability)}
        sub={`${stabilityPct.toFixed(0)}% of portfolio`}
        dot="bg-teal"
      />
      <Card
        label="Growth bucket"
        value={formatMoneyCompact(result.initialGrowth)}
        exact={formatMoney(result.initialGrowth)}
        sub={`${growthPct.toFixed(0)}% of portfolio`}
        dot="bg-amber"
      />
      <Card
        label="Withdrawal rate"
        value={`${(result.initialWithdrawalRate * 100).toFixed(2)}%`}
        sub="net, year one"
        dot="bg-teal-dark"
      />
      <div className="rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 to-gold/10 p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-teal">Success rate</p>
        <p className={`mt-2 font-heading text-3xl font-semibold ${successTone}`}>
          {(result.successRate * 100).toFixed(0)}%
        </p>
        <p className="mt-1 text-xs text-ink/60">
          of {result.meta.runs.toLocaleString()} runs end above $0
        </p>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  exact,
  sub,
  dot,
}: {
  label: string;
  value: string;
  exact?: string;
  sub: string;
  dot: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${dot}`} />
        <p className="text-xs font-medium uppercase tracking-wide text-ink/60">{label}</p>
      </div>
      <p
        className="mt-2 truncate font-heading text-2xl font-semibold tabular-nums text-teal-dark"
        title={exact ?? value}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-ink/60">{sub}</p>
    </div>
  );
}
