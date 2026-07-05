import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InvestmentInput, InvestmentResult } from '@/features/investment-calculator/types';
import { compactUSD } from '@/features/investment-calculator/format';
import { formatCurrency } from '@/lib/format';

type Props = {
  input: InvestmentInput;
  result: InvestmentResult;
};

interface Row {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

export function GrowthChart({ input, result }: Props) {
  const data = useMemo<Row[]>(() => {
    const rows: Row[] = [
      {
        year: 0,
        principal: input.startingAmount,
        interest: 0,
        balance: input.startingAmount,
      },
    ];
    let cumContrib = 0;
    for (const y of result.years) {
      cumContrib += y.contributions;
      const principal = input.startingAmount + cumContrib;
      rows.push({
        year: y.year,
        principal,
        interest: Math.max(0, y.endBalance - principal),
        balance: y.endBalance,
      });
    }
    return rows;
  }, [input.startingAmount, result.years]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">Balance over time</h3>
        <p className="text-xs text-ink/60">Contributions vs. growth, stacked</p>
      </div>
      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
            <defs>
              <linearGradient id="ic-principal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15807D" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#15807D" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="ic-interest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E09A33" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#F2C44E" stopOpacity={0.25} />
              </linearGradient>
            </defs>
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
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelFormatter={(year) => `Year ${year}`}
            />
            <Area
              type="monotone"
              dataKey="principal"
              stackId="1"
              stroke="#15807D"
              strokeWidth={1.5}
              fill="url(#ic-principal)"
              name="Contributions"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="interest"
              stackId="1"
              stroke="#E09A33"
              strokeWidth={1.5}
              fill="url(#ic-interest)"
              name="Growth"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
        <Swatch color="#15807D" label="Contributions (principal)" />
        <Swatch color="#E09A33" label="Growth (interest)" />
      </div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-4 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
