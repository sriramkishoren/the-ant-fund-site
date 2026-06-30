import { useEffect, useId, useState } from 'react';

type Props = {
  value: number; // fraction, e.g. 0.15 = 15%
  onChange: (n: number) => void;
};

export function TaxRateInput({ value, onChange }: Props) {
  const id = useId();

  // Local string draft so the user can freely type, clear, and partially
  // enter values like "1." without the controlled input reformatting their
  // input back to "0.0" on every keystroke. We only sync the draft down
  // from `value` when the parsed draft genuinely disagrees with it (i.e.
  // the change came from somewhere else, not this field).
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
    if (raw === '' || raw === '.' || raw === '-') return; // allow intermediate states
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n <= 50) {
      onChange(n / 100);
    }
  }

  function handleBlur() {
    // Normalize empty/garbage to 0% on blur so state stays consistent.
    if (draft === '' || draft === '.' || draft === '-') {
      setDraft('0');
      onChange(0);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
        Effective tax rate on withdrawals
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={50}
          step={0.5}
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          className="block w-full rounded-md border border-border bg-surface py-2 pl-3 pr-12 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/60">
          %
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/60">
        If you entered your <span className="font-medium text-teal-dark">after-tax</span> spending,
        we&apos;ll gross it up. Roth → use 0%. Mostly traditional/401(k) → try 15–22%. Set to 0 if
        you already entered a pre-tax figure.
      </p>
    </div>
  );
}
