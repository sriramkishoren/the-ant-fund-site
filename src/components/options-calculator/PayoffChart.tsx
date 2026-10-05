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
import type { OptionInput, OptionResult } from '@/features/options-calculator/types';
import { useCurrency } from '@/lib/currency-context';

type Props = { result: OptionResult; input: OptionInput };

interface Row {
  price: number;
  profit: number | null;
  loss: number | null;
  pl: number;
}

/**
 * Profit and loss at expiration across a range of prices for the underlying.
 * Profit is shaded teal, loss amber, with the breakeven, strike and today's
 * price marked.
 */
export function PayoffChart({ result, input }: Props) {
  const { money, moneyCompact } = useCurrency();

  const data = useMemo<Row[]>(
    () =>
      result.payoff.map((p) => ({
        price: p.price,
        // Splitting into two series lets the area above and below zero carry
        // different colours; null keeps each series off the other's side.
        profit: p.pl >= 0 ? p.pl : null,
        loss: p.pl < 0 ? p.pl : null,
        pl: p.pl,
      })),
    [result.payoff],
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">
          Profit and loss at expiration
        </h3>
        <p className="text-xs text-ink/60">
          Where the position stands on expiration day, for each price of the underlying.
        </p>
      </div>

      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer>
          {/* top margin leaves room for the 'Breakeven' label, which renders
                above the plot area and was otherwise clipped by the card edge */}
          <ComposedChart data={data} margin={{ top: 24, right: 12, bottom: 4, left: 8 }}>
            <defs>
              <linearGradient id="oc-profit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15807D" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#15807D" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="oc-loss" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#E09A33" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#E09A33" stopOpacity={0.08} />
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
              formatter={(value: number) => [money(value), 'Profit / loss']}
              labelFormatter={(price: number) => `Underlying at ${money(price)}`}
            />

            <Area
              type="monotone"
              dataKey="profit"
              stroke="none"
              fill="url(#oc-profit)"
              connectNulls={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="none"
              fill="url(#oc-loss)"
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pl"
              stroke="#0D5957"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />

            <ReferenceLine y={0} stroke="#1C2826" strokeOpacity={0.45} />
            <ReferenceLine
              x={result.breakeven}
              stroke="#0D5957"
              strokeDasharray="5 4"
              label={{ value: 'Breakeven', position: 'top', fontSize: 11, fill: '#0D5957' }}
            />
            <ReferenceLine
              x={input.strike}
              stroke="#E09A33"
              strokeDasharray="4 4"
              label={{ value: 'Strike', position: 'insideBottomRight', fontSize: 11, fill: '#E09A33' }}
            />
            <ReferenceLine x={input.currentPrice} stroke="#15807D" strokeWidth={1.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
        <Swatch color="#15807D" label="Profit" />
        <Swatch color="#E09A33" label="Loss" />
        <Swatch color="#15807D" line label={`Today — ${money(input.currentPrice)}`} />
        <Swatch color="#0D5957" line dashed label={`Breakeven — ${money(result.breakeven)}`} />
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
      {line ? (
        <span
          className="inline-block h-0.5 w-5"
          style={{
            backgroundColor: dashed ? 'transparent' : color,
            borderTop: dashed ? `2px dashed ${color}` : undefined,
          }}
        />
      ) : (
        <span className="inline-block h-3 w-4 rounded-sm" style={{ backgroundColor: color, opacity: 0.45 }} />
      )}
      {label}
    </span>
  );
}
