import type { OptionResult } from '@/features/options-calculator/types';
import { useCurrency } from '@/lib/currency-context';

/** "What happens at expiration" across a handful of prices. */
export function ScenarioTable({ result }: { result: OptionResult }) {
  const { money } = useCurrency();

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <h3 className="font-heading text-lg font-semibold text-teal-dark">
        What happens at expiration
      </h3>
      <p className="mt-1 text-xs text-ink/60">
        Profit or loss on the whole position, at a few prices for the underlying.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead className="text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Underlying</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Per share</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {result.scenarios.map((s) => (
              <tr key={s.price.toFixed(4)} className="border-t border-border/60">
                <td className="px-3 py-2 text-ink/85">
                  {money(s.price)}
                  {s.note ? (
                    <span className="ml-2 rounded bg-teal/10 px-1.5 py-0.5 text-[11px] font-medium text-teal-dark">
                      {s.note}
                    </span>
                  ) : null}
                </td>
                <td
                  className={`px-3 py-2 text-right ${s.plPerShare < 0 ? 'text-amber' : 'text-teal-dark'}`}
                >
                  {money(s.plPerShare)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-medium ${
                    s.plTotal < 0 ? 'text-amber' : 'text-teal-dark'
                  }`}
                >
                  {money(s.plTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
