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
import type { HistoricalYear } from '@/features/bucket-strategy/types';
import { formatMoney, formatMoneyCompact } from '@/features/bucket-strategy/money';

type Props = {
  path: HistoricalYear[];
};

interface Row {
  year: number;
  value: number; // real portfolio
  skipped: boolean;
  cut: boolean;
}

export function DotComStressChart({ path }: Props) {
  const data = useMemo<Row[]>(
    () =>
      path.map((y) => ({
        year: y.year,
        value: Math.round(y.portfolioReal),
        skipped: y.skipped,
        cut: y.cut,
      })),
    [path],
  );

  const survived = data.length > 0 && data[data.length - 1].value > 0;
  const startValue = data[0]?.value ?? 0;
  const endValue = data[data.length - 1]?.value ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">
          Dot-com stress test — retiring in January 2000
        </h3>
        <p className="text-xs text-ink/60">
          The historical worst case: dot-com crash then 2008, back to back. Real (today&rsquo;s
          dollars). Markers show where a crash-skip or a spending cut fired.
        </p>
      </div>

      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="#E6E0D5" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#1C2826' }} />
            <YAxis
              tickFormatter={(v: number) => formatMoneyCompact(v)}
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
              formatter={(value: number) => [formatMoney(value), 'Portfolio (real)']}
              labelFormatter={(year) => `${year}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0D5957"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={<EventDot />}
              activeDot={{ r: 4 }}
              name="Portfolio (real)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" aria-hidden="true" />
          Crash-skip (refill skipped)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full border-2 border-teal bg-white"
            aria-hidden="true"
          />
          Spending cut
        </span>
        <span className="ml-auto text-ink/70">
          {survived ? (
            <>
              Survived: {formatMoney(startValue)} →{' '}
              <span className="font-medium text-teal-dark">{formatMoney(endValue)}</span> real
            </>
          ) : (
            <span className="font-medium text-red-600">Depleted before the horizon</span>
          )}
        </span>
      </div>
    </div>
  );
}

/** Custom dot: amber for a crash-skip year, teal ring for a spending cut. */
function EventDot(props: { cx?: number; cy?: number; payload?: Row }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return <g />;
  if (payload.skipped) {
    return <circle cx={cx} cy={cy} r={4} fill="#E09A33" stroke="#fff" strokeWidth={1} />;
  }
  if (payload.cut) {
    return <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#15807D" strokeWidth={2} />;
  }
  return <g />;
}
