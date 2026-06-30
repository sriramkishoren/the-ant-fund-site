import { useId } from 'react';
import { formatPercent } from '@/lib/format';

type Preset = { label: string; rate: number; tone: 'teal' | 'amber' | 'gold' };

type Props = {
  value: number;
  onChange: (rate: number) => void;
  /** The dynamic default from CAPE — shown as the middle preset label. */
  capeAwareRate: number;
};

const STATIC_PRESETS: Preset[] = [
  { label: 'Morningstar 2026 (3.9%)', rate: 0.039, tone: 'teal' },
  { label: 'Bengen 2025 (4.7%)', rate: 0.047, tone: 'amber' },
];

export function SwrSlider({ value, onChange, capeAwareRate }: Props) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
          Safe withdrawal rate
        </label>
        <span className="font-heading text-lg font-semibold text-teal-dark">
          {formatPercent(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0.02}
        max={0.06}
        step={0.001}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 block w-full accent-teal"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <PresetChip
          label={`Valuation-aware (${formatPercent(capeAwareRate)})`}
          tone="gold"
          active={Math.abs(value - capeAwareRate) < 1e-4}
          onClick={() => onChange(capeAwareRate)}
        />
        {STATIC_PRESETS.map((p) => (
          <PresetChip
            key={p.label}
            label={p.label}
            tone={p.tone}
            active={Math.abs(value - p.rate) < 1e-4}
            onClick={() => onChange(p.rate)}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/60">
        Move the slider or pick a preset. The FIRE number is{' '}
        <span className="font-medium text-teal-dark">your annual spending ÷ this rate</span>.
      </p>
    </div>
  );
}

function PresetChip({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: 'teal' | 'amber' | 'gold';
  active: boolean;
  onClick: () => void;
}) {
  const toneCls = active
    ? tone === 'amber'
      ? 'bg-amber text-ink border-amber'
      : tone === 'gold'
        ? 'bg-gold text-ink border-gold'
        : 'bg-teal text-cream border-teal'
    : 'bg-surface text-teal-dark border-border hover:border-teal';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-teal ${toneCls}`}
    >
      {label}
    </button>
  );
}
