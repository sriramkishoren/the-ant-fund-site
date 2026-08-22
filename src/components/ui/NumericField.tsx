import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { InfoTooltip } from './InfoTooltip';
import { formatNumericDraft, groupingStyle, parseNumericDraft } from '@/lib/currency';
import { useCurrency } from '@/lib/currency-context';

/**
 * The single numeric input used by every calculator.
 *
 * Two problems are solved here, and both are why fields can't simply bind
 * `value={someNumber}` to an <input type="number">:
 *
 *  1. Editing. Clearing a bound number yields "", `Number("")` is 0, the state
 *     round-trips back as "0", and the next keystroke appends to it — so
 *     replacing 0 with 50 produced "050". The field therefore keeps its own
 *     *string* draft and only reports parsed numbers upward.
 *
 *  2. Readability. `<input type="number">` silently discards any value
 *     containing a separator (setting "1,000" leaves the field empty), so the
 *     control is a text input with inputMode="decimal" — which still opens the
 *     numeric keypad on mobile. Grouping comes from Intl via the selected
 *     currency: 1,000,000 in USD, 10,00,000 in INR, 1.000.000 in a locale that
 *     groups that way.
 *
 * The draft is the *formatted* string; every number handed to the calculator is
 * parsed from it, so calculations always run on the raw value. NaN, undefined
 * and null are never emitted.
 */

const controlBase =
  'block w-full rounded-lg border border-border bg-surface py-2 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal';

/** A partial number someone can legitimately be part-way through typing. */
function isIncomplete(raw: string): boolean {
  return raw === '' || raw === '-' || raw === '.' || raw === '-.' || raw.endsWith('.');
}

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

/** Count characters that aren't group separators — the ones a caret tracks. */
function significantBefore(text: string, caret: number, group: string): number {
  let n = 0;
  for (let i = 0; i < caret && i < text.length; i++) if (text[i] !== group) n++;
  return n;
}

/** Inverse of the above: caret offset after `count` significant characters. */
function caretAfter(text: string, count: number, group: string): number {
  let seen = 0;
  let i = 0;
  while (i < text.length && seen < count) {
    if (text[i] !== group) seen++;
    i++;
  }
  return i;
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
  inputMode?: 'decimal' | 'numeric';
  autoFocus?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
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
    step = 1,
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
    autoFocus = false,
    onKeyDown,
    onBlur,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const { currency } = useCurrency();
  const { group } = groupingStyle(currency);

  const toDisplay = useCallback((v: number) => (asPercent ? v * 100 : v), [asPercent]);
  const fromDisplay = (n: number) => (asPercent ? n / 100 : n);

  const innerRef = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const focused = useRef(false);

  const [draft, setDraft] = useState(() =>
    formatNumericDraft(String(toDisplay(value)), currency),
  );

  // Restore the caret after a reformat, otherwise inserting a separator would
  // knock the cursor to the end of the field on every keystroke.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (el && pendingCaret.current !== null && document.activeElement === el) {
      const pos = Math.min(pendingCaret.current, el.value.length);
      el.setSelectionRange(pos, pos);
    }
    pendingCaret.current = null;
  }, [draft]);

  // Pull the value down when it changes elsewhere (a preset, a solver, a
  // currency switch), and re-group when the currency changes. `Number("")` is 0,
  // so an empty field sitting on a 0 value compares equal and is left alone —
  // the user keeps their cleared field.
  useEffect(() => {
    const shown = toDisplay(value);
    const raw = parseNumericDraft(draft, currency);
    const parsed = Number(raw);
    const drifted = raw === '' ? shown !== 0 : !Number.isFinite(parsed) || Math.abs(parsed - shown) > 1e-9;

    if (drifted && !(focused.current && isIncomplete(raw))) {
      setDraft(formatNumericDraft(String(shown), currency));
    } else {
      // Same number, possibly different grouping convention.
      const regrouped = formatNumericDraft(raw, currency);
      if (regrouped !== draft) setDraft(regrouped);
    }
    // Keyed on the incoming value and currency only: re-running on every
    // keystroke would fight the user for control of the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currency, asPercent]);

  /** Apply a new display string, re-grouping it and keeping the caret put. */
  function applyText(text: string, caret: number) {
    const raw = parseNumericDraft(text, currency);
    const formatted = formatNumericDraft(raw, currency);
    pendingCaret.current = caretAfter(
      formatted,
      significantBefore(text, caret, group),
      group,
    );
    setDraft(formatted);

    if (isIncomplete(raw)) return; // mid-typing; nothing to report yet
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (min !== undefined && n < min) return; // reconciled on blur
    if (max !== undefined && n > max) return;
    onChange(fromDisplay(n));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(e);
    if (e.defaultPrevented || readOnly) return;

    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    // Backspace/Delete onto a separator should remove the adjacent digit, not
    // silently delete a character the formatter immediately puts back.
    if (e.key === 'Backspace' && start === end && start > 0 && el.value[start - 1] === group) {
      e.preventDefault();
      applyText(el.value.slice(0, start - 2) + el.value.slice(start), start - 2);
      return;
    }
    if (e.key === 'Delete' && start === end && el.value[start] === group) {
      e.preventDefault();
      applyText(el.value.slice(0, start) + el.value.slice(start + 2), start);
      return;
    }

    // Arrow-key stepping, replacing the spinners a text input doesn't have.
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const current = Number(parseNumericDraft(el.value, currency));
      const base = Number.isFinite(current) ? current : toDisplay(value);
      const next = clamp(
        Number((base + (e.key === 'ArrowUp' ? step : -step)).toFixed(10)),
        min,
        max,
      );
      setDraft(formatNumericDraft(String(next), currency));
      onChange(fromDisplay(next));
    }
  }

  function handleBlur() {
    focused.current = false;
    onBlur?.();
    const raw = parseNumericDraft(draft, currency);
    const n = Number(raw);
    if (raw === '' || !Number.isFinite(n)) {
      // Nothing usable typed — show whatever the calculator is actually using.
      setDraft(formatNumericDraft(String(toDisplay(value)), currency));
      return;
    }
    const clamped = clamp(n, min, max);
    setDraft(formatNumericDraft(String(clamped), currency));
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
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          data-numeric-field=""
          value={draft}
          readOnly={readOnly}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          // Exposed for assistive tech, since a text input carries no implicit range.
          role="spinbutton"
          aria-valuenow={Number.isFinite(value) ? toDisplay(value) : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(e) => applyText(e.target.value, e.target.selectionStart ?? e.target.value.length)}
          onKeyDown={handleKeyDown}
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
