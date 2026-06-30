import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';

const helpCls = 'mt-1 text-xs text-ink/60';
const errorCls = 'mt-1 text-xs font-medium text-amber';
const controlBase =
  'mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-ink shadow-sm transition-colors focus:border-teal focus-visible:outline-2 focus-visible:outline-teal disabled:bg-cream disabled:text-ink/50';

// Renders the label row with an optional info-tooltip trigger. The tooltip is
// shown on hover and on keyboard focus of the (?) button, and is wired to the
// input via aria-describedby for screen readers.
function FieldLabel({
  htmlFor,
  label,
  tip,
  tipId,
}: {
  htmlFor: string;
  label: string;
  tip?: string;
  tipId?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-teal-dark">
        {label}
      </label>
      {tip ? (
        <span className="group relative inline-flex">
          <button
            type="button"
            aria-describedby={tipId}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-teal/40 text-[10px] font-semibold leading-none text-teal-dark transition-colors hover:bg-teal/10 focus-visible:outline-2 focus-visible:outline-teal"
          >
            <span aria-hidden="true">?</span>
            <span className="sr-only">What is {label}?</span>
          </button>
          <span
            role="tooltip"
            id={tipId}
            className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-xs leading-snug text-ink shadow-md opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
          >
            {tip}
          </span>
        </span>
      ) : null}
    </div>
  );
}

type WithSuffix = { suffix?: ReactNode };

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  help?: string;
  /** Plain-language explanation surfaced via an info icon next to the label. */
  tip?: string;
  error?: string | null;
} & WithSuffix;

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { label, help, tip, error, suffix, id, className = '', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const tipId = tip ? `${inputId}-tip` : undefined;
  const describedBy = [
    help ? `${inputId}-help` : null,
    error ? `${inputId}-err` : null,
    tipId ?? null,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={className}>
      <FieldLabel htmlFor={inputId} label={label} tip={tip} tipId={tipId} />
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type="number"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${controlBase} ${suffix ? 'pr-12' : ''} ${error ? 'border-amber' : ''}`}
          {...rest}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 mt-1 flex items-center text-sm text-ink/60">
            {suffix}
          </span>
        ) : null}
      </div>
      {help && !error ? (
        <p id={`${inputId}-help`} className={helpCls}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-err`} className={errorCls} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  help?: string;
  tip?: string;
  error?: string | null;
  options: { value: string; label: string }[];
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, help, tip, error, options, id, className = '', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const tipId = tip ? `${inputId}-tip` : undefined;
  const describedBy = [
    help ? `${inputId}-help` : null,
    error ? `${inputId}-err` : null,
    tipId ?? null,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={className}>
      <FieldLabel htmlFor={inputId} label={label} tip={tip} tipId={tipId} />
      <select
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`${controlBase} appearance-none bg-no-repeat bg-right pr-9 ${error ? 'border-amber' : ''}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%230D5957'><path fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/></svg>\")",
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.25rem 1.25rem',
        }}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {help && !error ? (
        <p id={`${inputId}-help`} className={helpCls}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-err`} className={errorCls} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
