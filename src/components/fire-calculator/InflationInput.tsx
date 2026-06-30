import { useEffect, useId, useState } from 'react';

type Props = {
  value: number; // fraction, e.g. 0.03 = 3%
  onChange: (n: number) => void;
};

export function InflationInput({ value, onChange }: Props) {
  const id = useId();

  // Local string draft so the controlled input doesn't reformat the user's
  // input on every keystroke. See TaxRateInput for the full reasoning.
  const [draft, setDraft] = useState(() => (value * 100).toString());

  useEffect(() => {
    const pct = value * 100;
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || Math.abs(parsed - pct) > 1e-6) {
      setDraft(pct.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === '' || raw === '.' || raw === '-') return;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n <= 15) {
      onChange(n / 100);
    }
  }

  function handleBlur() {
    if (draft === '' || draft === '.' || draft === '-') {
      setDraft('0');
      onChange(0);
    }
  }

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
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
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
