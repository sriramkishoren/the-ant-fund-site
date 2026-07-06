import { effectiveStabilityTarget } from '@/features/bucket-strategy/rules';
import { formatMoney } from '@/features/bucket-strategy/money';
import type { BucketParams } from '@/features/bucket-strategy/types';

type Props = {
  params: BucketParams;
};

/** Live plain-language rendering of the user's current rule set. */
export function RulesPanel({ params }: Props) {
  const annual = params.monthlyExpenses * 12;
  const target = effectiveStabilityTarget({
    stabilityYears: params.stabilityYears,
    annualExpenses: annual,
    capPct: params.stabilityCapPct,
    portfolio: params.totalPortfolio,
  });

  const rules: React.ReactNode[] = [
    <>
      <strong className="text-teal-dark">Every year:</strong> refill the stability bucket up to{' '}
      <strong className="text-teal-dark">
        min({params.stabilityYears} years of spending, {params.stabilityCapPct}% of the portfolio)
      </strong>{' '}
      — currently {formatMoney(target)} — selling growth to top it up, or moving any excess back to
      growth.
    </>,
    <>
      <strong className="text-teal-dark">Skip that refill</strong> in any year equities fall{' '}
      {params.crashSkipThresholdPct}% or more — never sell stocks into a crash; live off the
      stability bucket instead.
    </>,
  ];

  if (params.guardrailsEnabled) {
    if (params.guardrailFreezeAfterNegative) {
      rules.push(
        <>
          <strong className="text-teal-dark">Freeze</strong> your inflation raise after any year
          equities finish negative.
        </>,
      );
    }
    rules.push(
      <>
        <strong className="text-teal-dark">Cut spending 10%</strong> whenever your withdrawal rate
        climbs above {params.guardrailCutRatePct}%, and{' '}
        <strong className="text-teal-dark">restore</strong> it step by step once the rate falls
        below {params.guardrailRestoreRatePct}%.
      </>,
    );
  } else {
    rules.push(
      <>
        <strong className="text-amber">Guardrails are off</strong> — spending rises with inflation
        every year regardless of what markets do.
      </>,
    );
  }

  if (params.socialSecurityMonthly > 0) {
    rules.push(
      <>
        <strong className="text-teal-dark">{formatMoney(params.socialSecurityMonthly)}/mo</strong> of
        Social Security or pension income starts in year {params.socialSecurityStartYear} and grows
        with inflation, reducing net withdrawals from then on.
      </>,
    );
  }

  if (params.partTimeMonthly > 0 && params.partTimeYears > 0) {
    rules.push(
      <>
        <strong className="text-teal-dark">{formatMoney(params.partTimeMonthly)}/mo</strong> of
        part-time income for the first {params.partTimeYears} years.
      </>,
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-teal-dark">Your rule set</h3>
      <p className="mt-1 text-xs text-ink/60">Updates live as you change the inputs.</p>
      <ul className="mt-4 space-y-3">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/85">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal"
            />
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
