import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SimResult } from '@/features/monte-carlo/types';
import { formatCompactUSD } from '@/features/monte-carlo/stats';

type Props = { result: SimResult };

interface BinRow {
  label: string;
  midpoint: number;
  success: number;
  failure: number;
  total: number;
}

export function OutcomeHistogram({ result }: Props) {
  const data = useMemo<BinRow[]>(() => {
    return result.terminalHistogram.map((b) => {
      const mid = (b.binStart + b.binEnd) / 2;
      return {
        label: formatCompactUSD(mid),
        midpoint: mid,
        success: b.successCount,
        failure: b.failureCount,
        total: b.successCount + b.failureCount,
      };
    });
  }, [result]);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">
          Distribution of terminal portfolio values
        </h3>
        <p className="text-xs text-ink/60">
          Teal = portfolio survived · amber = depleted before life expectancy
        </p>
      </div>
      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#E6E0D5" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#1C2826' }}
              interval={Math.max(0, Math.floor(data.length / 8))}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#1C2826' }}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E6E0D5',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                const pct = ((value / result.meta.runs) * 100).toFixed(1);
                return [`${value.toLocaleString()} runs (${pct}%)`, name];
              }}
              labelFormatter={(label) => `Terminal value ≈ ${label}`}
            />
            <Bar dataKey="success" stackId="a" name="Survived">
              {data.map((_, i) => (
                <Cell key={`s-${i}`} fill="#15807D" />
              ))}
            </Bar>
            <Bar dataKey="failure" stackId="a" name="Depleted">
              {data.map((_, i) => (
                <Cell key={`f-${i}`} fill="#E09A33" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
