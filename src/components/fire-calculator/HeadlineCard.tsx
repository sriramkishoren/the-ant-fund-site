import { formatCurrency, formatPercent } from '@/lib/format';

type Props = {
  fireNumber: number;
  multiple: number;
  swr: number;
  /** Spending the user entered (their after-tax need if taxRate > 0). */
  annualSpending: number;
  /** Grossed-up pre-tax withdrawal sized by the engine. Equals annualSpending when taxRate = 0. */
  grossWithdrawal: number;
  taxRate: number;
  /** Optional: years until retirement. When > 0 we also show the nominal
   *  inflated equivalent at retirement so users not retiring today understand
   *  the today's-dollars framing. */
  yearsToRetirement: number;
  /** Assumed annual inflation for the projection (e.g. 0.03 = 3%). */
  inflationRate: number;
};

export function HeadlineCard({
  fireNumber,
  multiple,
  swr,
  annualSpending,
  grossWithdrawal,
  taxRate,
  yearsToRetirement,
  inflationRate,
}: Props) {
  const display = Number.isFinite(fireNumber) ? formatCurrency(fireNumber) : '—';
  const mult = Number.isFinite(multiple) ? multiple.toFixed(1) : '—';

  const showProjection = yearsToRetirement > 0 && Number.isFinite(fireNumber);
  const inflated = showProjection
    ? fireNumber * Math.pow(1 + inflationRate, yearsToRetirement)
    : 0;
  const inflatedSpending = showProjection
    ? annualSpending * Math.pow(1 + inflationRate, yearsToRetirement)
    : 0;

  const taxApplied = taxRate > 0 && Number.isFinite(grossWithdrawal);

  return (
    <section
      aria-label="FIRE number"
      className="rounded-2xl border border-border bg-surface px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14"
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
        Your FIRE number
      </p>
      <p
        className="mt-3 font-heading text-5xl font-semibold leading-tight text-teal-dark sm:text-6xl lg:text-7xl"
        aria-live="polite"
      >
        {display}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
        in today&apos;s dollars
      </p>
      <p className="mt-4 text-sm text-ink/65">
        ≈ × {mult} of pre-tax annual withdrawal
      </p>

      {taxApplied ? (
        <p className="mx-auto mt-3 max-w-xl text-xs text-ink/65">
          After-tax spending {formatCurrency(annualSpending)}/yr ÷ (1 −{' '}
          {formatPercent(taxRate)} tax) ={' '}
          <span className="font-medium text-teal-dark">{formatCurrency(grossWithdrawal)}</span>/yr
          pre-tax withdrawal
        </p>
      ) : null}

      {showProjection ? (
        <div className="mx-auto mt-7 max-w-xl rounded-lg border border-border bg-cream/50 px-4 py-3 text-sm">
          <p className="text-ink/70">
            If you retire in <span className="font-medium text-teal-dark">{yearsToRetirement} years</span>, the same purchasing power is roughly{' '}
            <span className="font-medium text-teal-dark">{formatCurrency(inflated)}</span>{' '}
            in nominal dollars
            <span className="text-ink/55"> (≈ {formatCurrency(inflatedSpending)}/yr of spending at {formatPercent(inflationRate)} inflation).</span>
          </p>
        </div>
      ) : null}

      <p className="mx-auto mt-6 max-w-xl text-sm text-ink/75">
        {formatCurrency(grossWithdrawal)}/yr ÷ {formatPercent(swr)} = the portfolio that supports your withdrawal forever at this safe withdrawal rate.
      </p>
    </section>
  );
}
