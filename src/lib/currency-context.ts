// Context object + consumer hook, kept apart from the provider component so the
// module exports no components — which keeps React Fast Refresh working.

import { createContext, useContext } from 'react';
import type { CurrencyCode, CurrencyMeta } from './currency';

export interface CurrencyContextValue {
  currency: CurrencyCode;
  meta: CurrencyMeta;
  setCurrency: (c: CurrencyCode) => void;
  /** True once the stored preference has been restored on the client. */
  ready: boolean;
  // Pre-bound formatters so components never thread the currency code through.
  money: (value: number, withCents?: boolean) => string;
  moneyCompact: (value: number) => string;
  percent: (fraction: number) => string;
  number: (value: number) => string;
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used inside a <CurrencyProvider>');
  }
  return ctx;
}
