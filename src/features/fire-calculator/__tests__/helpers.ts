// Test helpers for the FIRE engine. Builds tiny synthetic datasets for
// closed-form sanity checks, and a loader that pulls the bundled JSON.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ShillerDataset, ShillerMonthlyRow } from '../data-types';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Read the bundled Shiller JSON the same way the worker will. */
export function loadBundledDataset(): ShillerDataset {
  const p = resolve(__dirname, '..', '..', '..', '..', 'public', 'data', 'shiller.json');
  return JSON.parse(readFileSync(p, 'utf8')) as ShillerDataset;
}

/**
 * Synthetic dataset where every month has identical (stockReturn, bondReturn,
 * inflation). Useful for closed-form tests.
 */
export function constantDataset(opts: {
  annualStockReal: number;
  annualBondReal: number;
  annualInflation: number;
  years?: number;
}): ShillerDataset {
  const years = opts.years ?? 150;
  // Per-month equivalents.
  const ms = Math.pow(1 + opts.annualStockReal, 1 / 12) - 1;
  const mb = Math.pow(1 + opts.annualBondReal, 1 / 12) - 1;
  const mi = Math.pow(1 + opts.annualInflation, 1 / 12) - 1;

  const rows: ShillerMonthlyRow[] = [];
  let cpi = 100;
  for (let y = 0; y < years; y++) {
    for (let m = 1; m <= 12; m++) {
      const date = `${(1900 + y).toString().padStart(4, '0')}-${m
        .toString()
        .padStart(2, '0')}`;
      rows.push({
        date,
        sp500RealReturnPct: ms * 100,
        bondRealReturnPct: mb * 100,
        cpi,
        cape: 17,
      });
      cpi *= 1 + mi;
    }
  }
  return {
    asOf: rows[rows.length - 1].date,
    rows,
    meta: {
      source: 'synthetic-facsimile',
      sourceUrl: 'test-helpers',
      generatedAt: new Date().toISOString(),
      generatorScript: 'scripts/build-shiller-dataset.ts',
    },
  };
}
