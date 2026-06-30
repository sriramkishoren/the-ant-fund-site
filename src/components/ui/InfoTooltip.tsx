import { type ReactNode, useId } from 'react';

type Props = {
  /** Hover/focus content. Can be plain text or a small inline element. */
  children: ReactNode;
  /** Short accessible label used on the trigger button (e.g. "What is CAPE?"). */
  label: string;
  /** Optional className for the wrapper if you need positional tweaks. */
  className?: string;
};

/**
 * Small (?) icon button that reveals a tooltip on hover and keyboard focus.
 * The same pattern used by Field.tsx — extracted so it can be dropped in
 * anywhere a one-line explanation is helpful.
 */
export function InfoTooltip({ children, label, className = '' }: Props) {
  const id = useId();
  return (
    <span className={`group relative inline-flex ${className}`}>
      <button
        type="button"
        aria-describedby={id}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-teal/40 text-[10px] font-semibold leading-none text-teal-dark transition-colors hover:bg-teal/10 focus-visible:outline-2 focus-visible:outline-teal"
      >
        <span aria-hidden="true">?</span>
        <span className="sr-only">{label}</span>
      </button>
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-xs leading-snug text-ink shadow-md opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
