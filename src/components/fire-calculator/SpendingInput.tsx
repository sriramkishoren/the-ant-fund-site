import { useId } from 'react';

type Props = {
  value: number;
  onChange: (n: number) => void;
};

export function SpendingInput({ value, onChange }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
        Annual spending in retirement
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/60">
          $
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={1000}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) && n >= 0 ? n : 0);
          }}
          className="block w-full rounded-md border border-border bg-surface py-3 pl-7 pr-12 text-lg font-medium text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/60">
          /yr
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/60">
        Today&apos;s dollars — the lifestyle you want to fund every year of retirement.
      </p>
    </div>
  );
}
