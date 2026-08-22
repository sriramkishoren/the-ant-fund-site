import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { InfoTooltip } from './InfoTooltip';

/**
 * The single numeric input used by every calculator.
 *
 * Why this exists: binding `value={someNumber}` directly to an <input> makes the
 * field impossible to clear. Clearing produces "", `Number("")` is 0, the state
 * round-trips back as "0", and the next keystroke appends to it — so replacing
 * 0 with 50 yields "050". Every field therefore keeps its own *string* draft and
 * only reports parsed numbers upward.
 *
 * Rules:
 *  - The draft may be empty or a partial number ("", "-", ".", "-.", "1.") while
 *    typing. Nothing is reported upward for those states.
 *  - Values outside [min, max] are not reported while typing (so a half-typed
 *    "5" never re-runs a simulation that needs 500), but blur reconciles the
 *    display with the committed value so the two can never silently diverge.
 *  - Blur normalises: empty resets to the committed value, out-of-range clamps,
 *    and "050" tidies to "50".
 *  - NaN/undefined/null are never emitted.
 */

const controlBase =
  'block w-full rounded-lg border border-border bg-surface py-2 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal';

/** Partial input a user can legitimately be part-way through typing. */
function isIncomplete(raw: string): boolean {
  return raw === '' || raw === '-' || raw === '.' || raw === '-.' || raw.endsWith('.');
}

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

export interface NumericFieldProps {
  label?: string;
  /** Canonical value. For percent fields this is a fraction (0.07 = 7%). */
  value: number;
  onChange: (n: number) => void;
  /** Present a fraction as a percent (×100 in, ÷100 out). */
  asPercent?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  help?: ReactNode;
  error?: string | null;
  /** Plain-language explanation surfaced via an info icon next to the label. */
  tip?: ReactNode;
  id?: string;
  className?: string;
  inputClassName?: string;
  readOnly?: boolean;
  /** Digits shown for the canonical value; defaults to "as short as possible". */
  inputMode?: 'decimal' | 'numeric';
  'aria-label'?: string;
}

export const NumericField = forwardRef<HTMLInputElement, NumericFieldProps>(function NumericField(
  {
    label,
    value,
    onChange,
    asPercent = false,
    min,
    max,
    step,
    prefix,
    suffix,
    help,
    error,
    tip,
    id,
    className = '',
    inputClassName = '',
    readOnly = false,
    inputMode = 'decimal',
    'aria-label': ariaLabel,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const toDisplay = (v: number) => (asPercent ? v * 100 : v);
  const fromDisplay = (n: number) => (asPercent ? n / 100 : n);

  const [draft, setDraft] = useState(() => String(toDisplay(value)));
  const focused = useRef(false);

  // Pull the value down when it changes elsewhere (a preset, a solver, a
  // currency switch). `Number("")` is 0, so an empty field sitting on a 0 value
  // compares equal and is left alone — the user keeps their cleared field.
  useEffect(() => {
    const shown = toDisplay(value);
    const parsed = Number(draft);
    const drifted = !Number.isFinite(parsed) || Math.abs(parsed - shown) > 1e-9;
    if (drifted && !(focused.current && isIncomplete(draft))) {
      setDraft(String(shown));
    }
    // Intentionally keyed on the incoming value only: re-running on every
    // keystroke would fight the user for control of the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, asPercent]);

  function handleChange(raw: string) {
    setDraft(raw);
    if (isIncomplete(raw)) return; // mid-typing; nothing to report yet
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (min !== undefined && n < min) return; // reconciled on blur
    if (max !== undefined && n > max) return;
    onChange(fromDisplay(n));
  }

  function handleBlur() {
    focused.current = false;
    const n = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(n)) {
      // Nothing usable typed — show whatever the calculator is actually using.
      setDraft(String(toDisplay(value)));
      return;
    }
    const clamped = clamp(n, min, max);
    setDraft(String(clamped)); // also tidies "050" → "50"
    if (Math.abs(clamped - toDisplay(value)) > 1e-9) onChange(fromDisplay(clamped));
  }

  const describedBy = [help ? `${inputId}-help` : null, error ? `${inputId}-err` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {label ? (
        <div className="flex items-center gap-1.5">
          <label htmlFor={inputId} className="block text-sm font-medium text-teal-dark">
            {label}
          </label>
          {tip ? <InfoTooltip label={`About ${label}`}>{tip}</InfoTooltip> : null}
        </div>
      ) : null}
      <div className="relative mt-1">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-ink/55">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          type="number"
          inputMode={inputMode}
          value={draft}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className={`${controlBase} ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'} ${
            error ? 'border-amber' : ''
          } ${readOnly ? 'cursor-default bg-cream font-medium text-teal-dark' : ''} ${inputClassName}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/55">
            {suffix}
          </span>
        ) : null}
      </div>
      {help && !error ? (
        <p id={`${inputId}-help`} className="mt-1 text-xs text-ink/60">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-err`} className="mt-1 text-xs font-medium text-amber" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
