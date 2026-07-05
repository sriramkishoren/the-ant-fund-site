import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InvestmentInput, InvestmentResult } from '@/features/investment-calculator/types';
import { compactUSD } from '@/features/investment-calculator/format';
import { formatCurrency, formatPercent } from '@/lib/format';

export interface Scenario {
  id: string;
  label: string;
  color: string;
  input: InvestmentInput;
  result: InvestmentResult;
}

type Props = {
  scenarios: Scenario[];
  onPinCurrent: () => void;
  onRemove: (id: string) => void;
  canPin: boolean;
};

function balanceAtYear(s: Scenario, year: number): number | undefined {
  if (year === 0) return s.input.startingAmount;
  return s.result.years[year - 1]?.endBalance;
}

export function ScenarioComparison({ scenarios, onPinCurrent, onRemove, canPin }: Props) {
  const chartData = useMemo(() => {
    const maxYear = scenarios.reduce((m, s) => Math.max(m, s.result.years.length), 0);
    const rows: Array<Record<string, number>> = [];
    for (let y = 0; y <= maxYear; y++) {
      const row: Record<string, number> = { year: y };
      for (const s of scenarios) {
        const b = balanceAtYear(s, y);
        if (b !== undefined) row[s.id] = b;
      }
      rows.push(row);
    }
    return rows;
  }, [scenarios]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-teal-dark">Compare scenarios</h3>
          <p className="mt-1 text-sm text-ink/65">
            Pin the current setup, then change an input and pin again to see them side by side.
          </p>
        </div>
        <button
          type="button"
          onClick={onPinCurrent}
          disabled={!canPin}
          className="rounded-lg bg-amber px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-gold focus-visible:outline-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Pin current scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border bg-cream/50 p-6 text-center text-sm text-ink/55">
          No scenarios pinned yet. Pin up to three to compare them on one chart.
        </p>
      ) : (
        <>
          <div className="mt-5 h-64 w-full sm:h-80">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
                <CartesianGrid stroke="#E6E0D5" strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: '#1C2826' }}
                  label={{
                    value: 'Year',
                    position: 'insideBottomRight',
                    offset: -2,
                    fontSize: 12,
                    fill: '#1C2826',
                  }}
                />
                <YAxis
                  tickFormatter={compactUSD}
                  tick={{ fontSize: 12, fill: '#1C2826' }}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E0D5',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => {
                    const s = scenarios.find((x) => x.id === name);
                    return [formatCurrency(value), s?.label ?? name];
                  }}
                  labelFormatter={(year) => `Year ${year}`}
                />
                {scenarios.map((s) => (
                  <Line
                    key={s.id}
                    type="monotone"
                    dataKey={s.id}
                    stroke={s.color}
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Scenario
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Return
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Years
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    End balance
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Interest
                  </th>
                  <th scope="col" className="px-3 py-2" aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="font-medium text-teal-dark">{s.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-ink/80">
                      {formatPercent(s.input.annualReturn)}
                    </td>
                    <td className="px-3 py-2 text-right text-ink/80">
                      {Math.round(s.input.years)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-teal-dark">
                      {formatCurrency(s.result.endBalance)}
                    </td>
                    <td className="px-3 py-2 text-right text-amber">
                      {formatCurrency(s.result.totalInterest)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onRemove(s.id)}
                        className="text-xs text-ink/55 underline-offset-2 hover:text-teal hover:underline"
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
