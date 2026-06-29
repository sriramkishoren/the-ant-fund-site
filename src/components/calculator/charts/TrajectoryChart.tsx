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
import type { SimResult } from '@/features/monte-carlo/types';
import { formatCompactUSD } from '@/features/monte-carlo/stats';
import { formatCurrency } from '@/lib/format';

type Props = {
  result: SimResult;
  retirementAge: number;
  /** Show ~100 raw simulated paths under the bands. */
  showSamplePaths?: boolean;
};

interface ChartRow {
  age: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  // Stored as ranged tuples for Recharts ranged areas: [low, high].
  band80: [number, number];
  band50: [number, number];
}

export function TrajectoryChart({ result, retirementAge, showSamplePaths = true }: Props) {
  const data = useMemo<ChartRow[]>(() => {
    return result.yearlyPercentiles.map((p) => ({
      age: p.age,
      p10: p.p10,
      p25: p.p25,
      p50: p.p50,
      p75: p.p75,
      p90: p.p90,
      band80: [p.p10, p.p90],
      band50: [p.p25, p.p75],
    }));
  }, [result]);

  // For the sample-path overlay: convert each path into a separate Line dataset
  // by merging into the chart rows. We add `s0..sN` keys so Recharts can render
  // a Line per sample at low opacity.
  const samplePathKeys = useMemo(() => {
    if (!showSamplePaths) return [];
    return result.samplePaths.map((_, i) => `s${i}`);
  }, [result.samplePaths, showSamplePaths]);

  const rowsWithSamples = useMemo<Array<ChartRow & Record<string, number | [number, number]>>>(
    () => {
      return data.map((row, yIdx) => {
        const merged = { ...row } as ChartRow & Record<string, number | [number, number]>;
        if (showSamplePaths) {
          result.samplePaths.forEach((path, i) => {
            merged[`s${i}`] = path[yIdx] ?? 0;
          });
        }
        return merged;
      });
    },
    [data, result.samplePaths, showSamplePaths],
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-teal-dark">
          Portfolio trajectory
        </h3>
        <p className="text-xs text-ink/60">
          Percentile bands across {result.meta.runs.toLocaleString()} runs · median line in teal
        </p>
      </div>
      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer>
          <ComposedChart data={rowsWithSamples} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#E6E0D5" strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 12, fill: '#1C2826' }}
              label={{
                value: 'Age',
                position: 'insideBottomRight',
                offset: -2,
                fontSize: 12,
                fill: '#1C2826',
              }}
            />
            <YAxis
              tickFormatter={formatCompactUSD}
              tick={{ fontSize: 12, fill: '#1C2826' }}
              width={64}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E6E0D5',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number | [number, number], name: string) => {
                if (Array.isArray(value)) {
                  return [`${formatCurrency(value[0])} – ${formatCurrency(value[1])}`, name];
                }
                return [formatCurrency(value), name];
              }}
              labelFormatter={(age) => `Age ${age}`}
            />
            <ReferenceLine
              x={retirementAge}
              stroke="#0D5957"
              strokeDasharray="4 4"
              label={{
                value: 'Retirement',
                position: 'top',
                fill: '#0D5957',
                fontSize: 11,
              }}
            />

            {/* Sample paths (rendered first, so bands cover them) */}
            {showSamplePaths
              ? samplePathKeys.map((k) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke="#15807D"
                    strokeOpacity={0.08}
                    strokeWidth={1}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                    name="Sample path"
                    legendType="none"
                  />
                ))
              : null}

            {/* 10–90 band */}
            <Area
              type="monotone"
              dataKey="band80"
              stroke="none"
              fill="#15807D"
              fillOpacity={0.12}
              name="10–90th percentile"
              isAnimationActive={false}
            />
            {/* 25–75 band */}
            <Area
              type="monotone"
              dataKey="band50"
              stroke="none"
              fill="#15807D"
              fillOpacity={0.22}
              name="25–75th percentile"
              isAnimationActive={false}
            />
            {/* Median line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#0D5957"
              strokeWidth={2.5}
              dot={false}
              name="Median"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
        <LegendSwatch color="#0D5957" label="Median" line />
        <LegendSwatch color="#15807D" label="25–75%" opacity={0.5} />
        <LegendSwatch color="#15807D" label="10–90%" opacity={0.25} />
        {showSamplePaths ? (
          <LegendSwatch color="#15807D" label="100 sample paths" line dashed />
        ) : null}
      </div>
    </div>
  );
}

function LegendSwatch({
  color,
  label,
  line = false,
  opacity = 1,
  dashed = false,
}: {
  color: string;
  label: string;
  line?: boolean;
  opacity?: number;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {line ? (
        <span
          className="inline-block h-0.5 w-5"
          style={{
            backgroundColor: color,
            opacity,
            borderTop: dashed ? `1.5px dashed ${color}` : undefined,
            backgroundClip: 'border-box',
          }}
        />
      ) : (
        <span
          className="inline-block h-3 w-4 rounded-sm"
          style={{ backgroundColor: color, opacity }}
        />
      )}
      {label}
    </span>
  );
}
