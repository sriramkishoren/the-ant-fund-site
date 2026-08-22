import { useCurrency } from '@/lib/currency-context';
import type { CurrencyDefaultsState } from '@/lib/useCurrencyDefaults';

/**
 * Shown after a currency switch when the user's own numbers were preserved —
 * they may well want figures sized for the new currency instead.
 */
export function LocaleDefaultsPrompt({ state }: { state: CurrencyDefaultsState }) {
  const { meta } = useCurrency();
  if (!state.stale) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber/50 bg-amber/5 px-4 py-3 text-xs text-ink/80"
    >
      <span>
        Your own figures were kept, so they&rsquo;re still sized for the previous currency.
      </span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          onClick={state.loadDefaults}
          className="rounded-md bg-amber px-3 py-1.5 font-semibold text-ink transition-colors hover:bg-gold focus-visible:outline-2 focus-visible:outline-teal"
        >
          Load {meta.symbol} defaults
        </button>
        <button
          type="button"
          onClick={state.dismiss}
          className="text-ink/55 underline-offset-2 hover:text-teal hover:underline"
        >
          Keep mine
        </button>
      </span>
    </div>
  );
}
