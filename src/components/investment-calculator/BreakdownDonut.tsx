import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { InvestmentResult } from '@/features/investment-calculator/types';
import { formatCurrency } from '@/lib/format';

type Props = {
  result: InvestmentResult;
};

const SLICES = [
  { key: 'startingAmount', label: 'Starting amount', color: '#0D5957' },
  { key: 'totalContributions', label: 'Contributions', color: '#15807D' },
  { key: 'totalInterest', label: 'Interest', color: '#E09A33' },
] as const;

export function BreakdownDonut({ result }: Props) {
  const data = SLICES.map((s) => ({
    name: s.label,
    value: Math.max(0, result[s.key]),
    color: s.color,
  })).filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <h3 className="mb-3 font-heading text-lg font-semibold text-teal-dark">
        Where the balance comes from
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-52 w-full max-w-[220px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="90%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E6E0D5',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-ink/80">{d.name}</span>
              </span>
              <span className="text-right">
                <span className="font-medium text-teal-dark">{formatCurrency(d.value)}</span>
                <span className="ml-2 text-xs text-ink/55">
                  {total > 0 ? `${Math.round((d.value / total) * 100)}%` : '0%'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
