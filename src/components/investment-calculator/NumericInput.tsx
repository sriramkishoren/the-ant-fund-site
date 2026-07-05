import { useEffect, useId, useState } from 'react';

type Props = {
  label: string;
  /** Canonical numeric value. For percent fields this is a fraction (0.07). */
  value: number;
  onChange: (n: number) => void;
  /** Present a fraction as a percent (×100 in, ÷100 out). */
  asPercent?: boolean;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  /** Read-only output mode — used when this field is the "solved for" answer. */
  readOnly?: boolean;
};

/**
 * Number input backed by a local string draft so typing, clearing, and partial
 * entries ("1.", "") never get reformatted mid-keystroke. Emits parsed numbers
 * only while the draft is a valid, in-range number; normalises on blur.
 */
export function NumericInput({
  label,
  value,
  onChange,
  asPercent = false,
  prefix,
  suffix,
  min,
  max,
  step,
  help,
  readOnly = false,
}: Props) {
  const id = useId();
  const toDisplay = (v: number) => (asPercent ? v * 100 : v);
  const [draft, setDraft] = useState(() => String(toDisplay(value)));

  // Sync the draft down only when the incoming value genuinely disagrees with
  // what's typed (e.g. a solver or preset changed it elsewhere).
  useEffect(() => {
    const shown = toDisplay(value);
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || Math.abs(parsed - shown) > 1e-9) {
      setDraft(String(shown));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function commit(raw: string) {
    setDraft(raw);
    if (raw === '' || raw === '.' || raw === '-') return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (min !== undefined && n < min) return;
    if (max !== undefined && n > max) return;
    onChange(asPercent ? n / 100 : n);
  }

  function handleBlur() {
    if (draft === '' || draft === '.' || draft === '-') {
      const fallback = min ?? 0;
      setDraft(String(fallback));
      onChange(asPercent ? fallback / 100 : fallback);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-teal-dark">
        {label}
      </label>
      <div className="relative mt-1">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink/55">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={draft}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          aria-readonly={readOnly || undefined}
          onChange={(e) => commit(e.target.value)}
          onBlur={handleBlur}
          className={`block w-full rounded-lg border border-border bg-surface py-2 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal ${
            prefix ? 'pl-7' : 'pl-3'
          } ${suffix ? 'pr-12' : 'pr-3'} ${
            readOnly ? 'cursor-default bg-cream font-medium text-teal-dark' : ''
          }`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/55">
            {suffix}
          </span>
        ) : null}
      </div>
      {help ? <p className="mt-1 text-xs text-ink/60">{help}</p> : null}
    </div>
  );
}
