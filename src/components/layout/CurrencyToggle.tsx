import { useCurrency } from '@/lib/currency-context';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';

const ORDER: CurrencyCode[] = ['USD', 'INR'];

/**
 * Site-wide currency switch. Every calculator reads the same preference, and it
 * persists across visits.
 */
export function CurrencyToggle({ className = '' }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Display currency"
      className={`inline-flex items-center rounded-full border border-border bg-surface p-0.5 ${className}`}
    >
      {ORDER.map((code) => {
        const meta = CURRENCIES[code];
        const active = currency === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setCurrency(code)}
            aria-pressed={active}
            title={`Show amounts in ${meta.label}`}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold leading-none transition-colors focus-visible:outline-2 focus-visible:outline-teal ${
              active ? 'bg-teal text-white' : 'text-ink/60 hover:text-teal-dark'
            }`}
          >
            <span aria-hidden="true">{meta.symbol}</span>
            <span className="sr-only">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
