import { formatCurrency, formatPercent } from '@/lib/format';

type Props = {
  fireNumber: number;
  multiple: number;
  swr: number;
  annualSpending: number;
};

export function HeadlineCard({ fireNumber, multiple, swr, annualSpending }: Props) {
  // Robust display for absurd inputs.
  const display = Number.isFinite(fireNumber) ? formatCurrency(fireNumber) : '—';
  const mult = Number.isFinite(multiple) ? multiple.toFixed(1) : '—';

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
      <p className="mt-3 text-sm text-ink/65">
        ≈ × {mult} of annual spending
      </p>
      <p className="mx-auto mt-6 max-w-xl text-sm text-ink/75">
        {formatCurrency(annualSpending)}/yr ÷ {formatPercent(swr)} = the portfolio that supports your spending forever at this safe withdrawal rate.
      </p>
    </section>
  );
}
