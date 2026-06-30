import { useId } from 'react';

type Props = {
  value: number;
  onChange: (n: number) => void;
};

export function YearsToRetirementInput({ value, onChange }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
        Years until retirement
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={60}
          step={1}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) && n >= 0 ? Math.min(60, n) : 0);
          }}
          className="block w-full rounded-md border border-border bg-surface py-2 pl-3 pr-12 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/60">
          yrs
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/60">
        Leave at <span className="font-medium text-teal-dark">0</span> if you&apos;re retiring now.
        Otherwise we&apos;ll also show the inflated nominal target.
      </p>
    </div>
  );
}
