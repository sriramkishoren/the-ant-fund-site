import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StrategyResult } from '@/features/strategy-builder/types';
import { useCurrency } from '@/lib/currency-context';

interface Row {
  price: number;
  profit: number | null;
  loss: number | null;
  expiry: number;
  today: number;
}

export function PayoffGraph({ result, spot }: { result: StrategyResult; spot: number }) {
  const { money, moneyCompact } = useCurrency();

  const data = useMemo<Row[]>(
    () =>
      result.expirationCurve.map((p, i) => ({
        price: p.price,
        profit: p.pl >= 0 ? p.pl : null,
        loss: p.pl < 0 ? p.pl : null,
        expiry: p.pl,
        today: result.todayCurve[i]?.pl ?? 0,
      })),
    [result.expirationCurve, result.todayCurve],
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">Payoff</h3>
        <p className="text-xs text-ink/60">
          Solid is expiration. Dashed is where the position stands today, with time value still in
          it.
        </p>
      </div>

      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 24, right: 12, bottom: 4, left: 8 }}>
            <defs>
              <linearGradient id="sb-profit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15807D" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#15807D" stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id="sb-loss" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#E09A33" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#E09A33" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E6E0D5" strokeDasharray="3 3" />
            <XAxis
              dataKey="price"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v: number) => moneyCompact(v)}
              tick={{ fontSize: 12, fill: '#1C2826' }}
            />
            <YAxis
              tickFormatter={(v: number) => moneyCompact(v)}
              tick={{ fontSize: 12, fill: '#1C2826' }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E6E0D5',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                money(value),
                name === 'today' ? 'Today' : 'At expiration',
              ]}
              labelFormatter={(price: number) => `Underlying at ${money(price)}`}
            />

            <Area type="monotone" dataKey="profit" stroke="none" fill="url(#sb-profit)" connectNulls={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="loss" stroke="none" fill="url(#sb-loss)" connectNulls={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="expiry" stroke="#0D5957" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="today" stroke="#15807D" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />

            <ReferenceLine y={0} stroke="#1C2826" strokeOpacity={0.45} />
            <ReferenceLine x={spot} stroke="#15807D" strokeWidth={1.5} />
            {result.breakevens.map((b) => (
              <ReferenceLine
                key={b}
                x={b}
                stroke="#0D5957"
                strokeDasharray="5 4"
                label={{ value: 'BE', position: 'top', fontSize: 11, fill: '#0D5957' }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
        <Swatch color="#0D5957" line label="At expiration" />
        <Swatch color="#15807D" line dashed label="Today" />
        <Swatch color="#15807D" label={`Spot — ${money(spot)}`} />
      </div>
    </div>
  );
}

function Swatch({
  color,
  label,
  line = false,
  dashed = false,
}: {
  color: string;
  label: string;
  line?: boolean;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-5"
        style={{
          backgroundColor: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          height: line || dashed ? undefined : 3,
        }}
      />
      {label}
    </span>
  );
}
