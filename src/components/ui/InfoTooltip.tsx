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
 *
 * The popover is display:none while closed rather than visibility:hidden — an
 * invisible element still counts toward page width, so a closed tooltip near
 * the edge of a phone screen made the whole page scroll sideways.
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
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-xs leading-snug text-ink shadow-md group-hover:block group-focus-within:block"
      >
        {children}
      </span>
    </span>
  );
}
