import { useMemo, useState } from 'react';
import type { StrategyResult } from '@/features/strategy-builder/types';
import { useCurrency } from '@/lib/currency-context';

export type MatrixMode = 'pl' | 'plPct' | 'maxRisk' | 'collateral' | 'value';

const MODES: { id: MatrixMode; label: string }[] = [
  { id: 'pl', label: 'Profit / loss' },
  { id: 'plPct', label: '% of net cost' },
  { id: 'maxRisk', label: '% of max risk' },
  { id: 'collateral', label: '% of collateral' },
  { id: 'value', label: 'Position value' },
];

/** Teal for profit, amber for loss, scaled against the biggest swing on screen. */
function cellStyle(pl: number, peak: number): { background: string; color: string } {
  if (peak <= 0 || Math.abs(pl) < 1e-9) return { background: 'transparent', color: '#1C2826' };
  const alpha = Math.min(0.85, (Math.abs(pl) / peak) * 0.85);
  const rgb = pl > 0 ? '21, 128, 125' : '224, 154, 51';
  return {
    background: `rgba(${rgb}, ${alpha.toFixed(3)})`,
    color: alpha > 0.5 ? '#FFFFFF' : '#1C2826',
  };
}

export function PayoffMatrix({ result }: { result: StrategyResult }) {
  const { money, moneyCompact } = useCurrency();
  const [mode, setMode] = useState<MatrixMode>('pl');
  const { matrix } = result;

  const denominator = useMemo(() => {
    switch (mode) {
      case 'plPct':
        return Math.abs(result.netCashflow);
      case 'maxRisk':
        return result.maxLoss === null ? 0 : Math.abs(result.maxLoss);
      case 'collateral':
        return result.collateral ?? 0;
      default:
        return 0;
    }
  }, [mode, result]);

  const unavailable = (mode === 'maxRisk' || mode === 'collateral') && denominator <= 0;

  const peak = useMemo(() => {
    let max = 0;
    for (const row of matrix.cells) {
      for (const c of row) max = Math.max(max, Math.abs(mode === 'value' ? c.value : c.pl));
    }
    return max;
  }, [matrix, mode]);

  function render(pl: number, value: number): string {
    if (mode === 'value') return moneyCompact(value);
    if (mode === 'pl') return moneyCompact(pl);
    if (denominator <= 0) return '—';
    return `${((pl / denominator) * 100).toFixed(1)}%`;
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-teal-dark">
            Profit and loss over time
          </h3>
          <p className="text-xs text-ink/60">
            Each column is a day between today and expiry; each row a price for the underlying.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-teal ${
                mode === m.id
                  ? 'bg-teal text-white'
                  : 'border border-border bg-surface text-ink/70 hover:bg-cream'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {unavailable ? (
        <p className="rounded-lg border border-amber/40 bg-amber/5 px-3 py-2 text-xs text-ink/75">
          This view needs a defined risk. The position has unlimited loss, so there is no maximum
          risk or collateral to measure against.
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-right text-xs tabular-nums">
          <caption className="sr-only">
            Profit and loss for each underlying price and date between today and expiration.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-surface px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-ink/55"
              >
                Price
              </th>
              {matrix.days.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="px-2 py-2 text-[11px] font-medium text-ink/60"
                  title={d === 0 ? 'Today' : `${d} days from today`}
                >
                  {d === 0 ? 'Today' : `+${d}d`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.prices.map((price, row) => (
              <tr key={price}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 whitespace-nowrap bg-surface px-2 py-1.5 text-left font-medium text-teal-dark"
                >
                  {money(price)}
                </th>
                {matrix.cells[row].map((cell, col) => {
                  const basis = mode === 'value' ? cell.value : cell.pl;
                  const style = cellStyle(basis, peak);
                  return (
                    <td
                      key={matrix.days[col]}
                      className="whitespace-nowrap px-2 py-1.5"
                      style={style}
                      title={`${money(price)} on day ${matrix.days[col]} — ${money(cell.pl)}`}
                    >
                      {render(cell.pl, cell.value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-ink/55">
        Values before expiry come from a Black–Scholes estimate, so they move with volatility and
        time. The final column is expiration, where only intrinsic value remains.
      </p>
    </div>
  );
}
