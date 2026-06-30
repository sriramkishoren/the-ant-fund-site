import { useId } from 'react';

type Props = {
  value: number; // fraction, e.g. 0.03 = 3%
  onChange: (n: number) => void;
};

export function InflationInput({ value, onChange }: Props) {
  const id = useId();
  const display = (value * 100).toFixed(1);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
        Assumed inflation
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={15}
          step={0.1}
          value={display}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= 0 && n <= 15) {
              onChange(n / 100);
            }
          }}
          className="block w-full rounded-md border border-border bg-surface py-2 pl-3 pr-12 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/60">
          %/yr
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/60">
        Only used for the nominal-at-retirement projection. The long-run US average is about{' '}
        <span className="font-medium text-teal-dark">3%</span>.
      </p>
    </div>
  );
}
