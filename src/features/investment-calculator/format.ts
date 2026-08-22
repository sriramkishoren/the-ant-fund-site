// Non-money formatting local to the Investment Calculator. Currency formatting
// lives in src/lib/currency.ts so it follows the user's selected currency.

/** "12.3 years" / "1 year", rounded to one decimal. */
export function formatYears(years: number): string {
  const rounded = Math.round(years * 10) / 10;
  return `${rounded} ${rounded === 1 ? 'year' : 'years'}`;
}
