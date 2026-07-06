// Currency-configurable money formatting. Defaults to USD; the CurrencyConfig
// parameter is the seam that lets an INR variant reuse this engine + UI later
// without touching the number logic.

import type { CurrencyConfig } from './types';

export const USD: CurrencyConfig = { code: 'USD', locale: 'en-US' };

/** Full currency, no cents: $1,500,000. */
export function formatMoney(value: number, cfg: CurrencyConfig = USD): string {
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact currency for chart axes / tight cards: $1.5M, $850K. */
export function formatMoneyCompact(value: number, cfg: CurrencyConfig = USD): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const symbol = currencySymbol(cfg);
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${sign}${symbol}${Math.round(abs)}`;
}

/** Best-effort currency symbol from the locale/code (used only in compact form). */
function currencySymbol(cfg: CurrencyConfig): string {
  const parts = new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    maximumFractionDigits: 0,
  }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? '$';
}
