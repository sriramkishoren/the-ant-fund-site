import type { ShillerDataset, ShillerMonthlyRow } from './data-types';

export interface AnnualizedRow {
  /** ISO yyyy of the calendar year. */
  year: number;
  /** Annual real total return on S&P (compounded over 12 months). */
  stockRealReturn: number;
  /** Annual real total return on bonds (compounded over 12 months). */
  bondRealReturn: number;
  /** Annual CPI inflation: cpi[end] / cpi[start] - 1. */
  inflation: number;
  /** CAPE at the start of the year (Jan reading). */
  startCape: number;
}

/** Latest CAPE reading from the dataset. */
export function latestCape(dataset: ShillerDataset): { value: number; asOf: string } {
  const last = dataset.rows[dataset.rows.length - 1];
  return { value: last.cape, asOf: last.date };
}

/**
 * Roll up monthly Shiller rows into one annual record per calendar year.
 * Months are compounded multiplicatively; the year is included only if it has
 * a full 12-month run in the dataset.
 */
export function annualize(dataset: ShillerDataset): AnnualizedRow[] {
  const byYear = new Map<number, ShillerMonthlyRow[]>();
  for (const row of dataset.rows) {
    const y = parseInt(row.date.slice(0, 4), 10);
    let list = byYear.get(y);
    if (!list) {
      list = [];
      byYear.set(y, list);
    }
    list.push(row);
  }

  const out: AnnualizedRow[] = [];
  const years = [...byYear.keys()].sort((a, b) => a - b);
  for (const year of years) {
    const months = byYear.get(year)!;
    if (months.length < 12) continue;
    let stockFactor = 1;
    let bondFactor = 1;
    for (const m of months) {
      stockFactor *= 1 + m.sp500RealReturnPct / 100;
      bondFactor *= 1 + m.bondRealReturnPct / 100;
    }
    const startCpi = months[0].cpi;
    const endCpi = months[months.length - 1].cpi;
    out.push({
      year,
      stockRealReturn: stockFactor - 1,
      bondRealReturn: bondFactor - 1,
      inflation: endCpi / startCpi - 1,
      startCape: months[0].cape,
    });
  }
  return out;
}
