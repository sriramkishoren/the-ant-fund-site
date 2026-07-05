// Local formatting helpers for the Investment Calculator. Currency/percent for
// the site come from lib/format; this adds a compact axis formatter and a
// years formatter used only here.

import { formatCurrency } from '@/lib/format';

/** Compact currency for chart axes: $1.2M, $340k, $920. */
export function compactUSD(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${Math.round(abs / 1e3)}k`;
  return `${sign}$${Math.round(abs)}`;
}

/** "12.3 years" / "1 year", rounded to one decimal. */
export function formatYears(years: number): string {
  const rounded = Math.round(years * 10) / 10;
  return `${rounded} ${rounded === 1 ? 'year' : 'years'}`;
}

export { formatCurrency };
