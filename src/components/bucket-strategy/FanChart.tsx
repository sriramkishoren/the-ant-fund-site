import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SimulationResult } from '@/features/bucket-strategy/types';
import { formatMoney, formatMoneyCompact } from '@/features/bucket-strategy/money';

type Props = {
  primary: SimulationResult;
  comparison: SimulationResult;
};

interface Row {
  year: number;
  band80: [number, number];
  band50: [number, number];
  p50: number;
  cmp?: number;
}

export function FanChart({ primary, comparison }: Props) {
  const [mode, setMode] = useState<'real' | 'nominal'>('real');
  const [showComparison, setShowComparison] = useState(false);

  const data = useMemo<Row[]>(() => {
    const bands = mode === 'real' ? primary.bandsReal : primary.bandsNominal;
    const cmpBands = mode === 'real' ? comparison.bandsReal : comparison.bandsNominal;
    return bands.map((b, i) => ({
      year: b.year,
      band80: [b.p10, b.p90],
      band50: [b.p25, b.p75],
      p50: b.p50,
      cmp: cmpBands[i]?.p50,
    }));
  }, [mode, primary, comparison]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-teal-dark">
            Portfolio outcomes over time
          </h3>
          <p className="text-xs text-ink/60">
            Percentile bands across {primary.meta.runs.toLocaleString()} runs ·{' '}
            {mode === 'real' ? "today's dollars" : 'nominal dollars'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            active={mode === 'real'}
            onClick={() => setMode('real')}
            label="Real"
          />
          <Toggle
            active={mode === 'nominal'}
            onClick={() => setMode('nominal')}
            label="Nominal"
          />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Toggle
            active={showComparison}
            onClick={() => setShowComparison((v) => !v)}
            label="Compare guardrails off"
          />
        </div>
      </div>

      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
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
              formatter={(value: number | [number, number], name: string) => {
                if (Array.isArray(value)) {
                  return [`${formatMoney(value[0])} – ${formatMoney(value[1])}`, name];
                }
                return [formatMoney(value), name];
              }}
              labelFormatter={(year) => `Year ${year}`}
            />
            <Area
              type="monotone"
              dataKey="band80"
              stroke="none"
              fill="#15807D"
              fillOpacity={0.12}
              name="10–90th percentile"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="band50"
              stroke="none"
              fill="#15807D"
              fillOpacity={0.22}
              name="25–75th percentile"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#0D5957"
              strokeWidth={2.5}
              dot={false}
              name="Median"
              isAnimationActive={false}
            />
            {showComparison ? (
              <Line
                type="monotone"
                dataKey="cmp"
                stroke="#E09A33"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Median (guardrails off)"
                isAnimationActive={false}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink/65">
        <Swatch color="#0D5957" label="Median" line />
        <Swatch color="#15807D" label="25–75%" opacity={0.5} />
        <Swatch color="#15807D" label="10–90%" opacity={0.25} />
        {showComparison ? <Swatch color="#E09A33" label="Median, guardrails off" line dashed /> : null}
      </div>
    </div>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-teal ${
        active ? 'bg-teal text-white' : 'border border-border bg-surface text-ink/70 hover:bg-cream'
      }`}
    >
      {label}
    </button>
  );
}

function Swatch({
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
          style={{ backgroundColor: dashed ? 'transparent' : color, opacity, borderTop: dashed ? `2px dashed ${color}` : undefined }}
        />
      ) : (
        <span className="inline-block h-3 w-4 rounded-sm" style={{ backgroundColor: color, opacity }} />
      )}
      {label}
    </span>
  );
}
