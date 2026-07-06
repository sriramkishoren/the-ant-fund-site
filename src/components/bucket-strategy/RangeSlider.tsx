import { useId } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

type Props = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Rendered next to the live value, e.g. "years" or "%". */
  unit?: string;
  tip?: string;
};

/** Labeled range slider with a live value read-out, matching the site tokens. */
export function RangeSlider({ label, value, onChange, min, max, step = 1, unit, tip }: Props) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
            {label}
          </label>
          {tip ? <InfoTooltip label={`About ${label}`}>{tip}</InfoTooltip> : null}
        </span>
        <span className="font-heading text-base font-semibold text-teal-dark">
          {value}
          {unit ? <span className="ml-0.5 text-sm font-normal text-ink/60">{unit}</span> : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 block w-full accent-teal"
      />
    </div>
  );
}
