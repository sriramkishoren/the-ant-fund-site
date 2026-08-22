import { useCallback, useEffect, useRef, useState } from 'react';
import type { CurrencyCode } from './currency';
import { useCurrency } from './currency-context';

function shallowEqual(a: object, b: object): boolean {
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  const ka = Object.keys(ra);
  if (ka.length !== Object.keys(rb).length) return false;
  return ka.every((k) => Object.is(ra[k], rb[k]));
}

export interface CurrencyDefaultsState {
  /**
   * True when the currency changed but the user's edited inputs were kept, so
   * the numbers on screen are still sized for the previous currency.
   */
  stale: boolean;
  loadDefaults: () => void;
  dismiss: () => void;
}

/**
 * Keeps a tool's inputs sensible across a currency switch.
 *
 * Relabelling $1.5M as ₹15,00,000 would be nonsense, but silently discarding a
 * plan someone has been editing would be worse. So: if the inputs are still
 * untouched defaults, swap them for the new currency's defaults silently. If
 * the user has edited anything, keep every number exactly as typed and let the
 * caller surface a one-click "load defaults" instead.
 *
 * No FX conversion is involved — switching currency gives you a locally-sized
 * plan, not a converted one.
 */
export function useCurrencyDefaults<T extends object>(
  getDefaults: (c: CurrencyCode) => T,
  value: T,
  apply: (next: T) => void,
): CurrencyDefaultsState {
  const { currency } = useCurrency();
  const previous = useRef(currency);
  const [stale, setStale] = useState(false);

  // Read the latest value/callback without making them effect dependencies —
  // this must fire on a currency change only, never on every keystroke.
  const latest = useRef({ value, apply, getDefaults });
  latest.current = { value, apply, getDefaults };

  useEffect(() => {
    const from = previous.current;
    if (from === currency) return;
    previous.current = currency;

    const { value: current, apply: set, getDefaults: defs } = latest.current;
    if (shallowEqual(current, defs(from))) {
      set(defs(currency));
      setStale(false);
    } else {
      setStale(true);
    }
  }, [currency]);

  const loadDefaults = useCallback(() => {
    latest.current.apply(latest.current.getDefaults(currency));
    setStale(false);
  }, [currency]);

  return { stale, loadDefaults, dismiss: () => setStale(false) };
}
