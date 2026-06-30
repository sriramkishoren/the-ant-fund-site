// Emits public/data/shiller.json — the monthly historical dataset the FIRE
// calculator's block-bootstrap engine resamples.
//
// ─── HOW TO REFRESH WITH REAL DATA ──────────────────────────────────────────
// This script currently produces a **synthetic facsimile** of Shiller's
// dataset, calibrated to long-run US-market statistics and seeded so it's
// reproducible. To replace with real Shiller numbers:
//
//   1. Download "U.S. Stock Markets 1871-Present and CAPE Ratio" from
//      Robert Shiller's site: http://www.econ.yale.edu/~shiller/data.htm
//      (the file is `ie_data.xls`).
//   2. Export the monthly sheet to CSV.
//   3. Replace the body of `generateRows()` below with a parser that maps
//      CSV columns to ShillerMonthlyRow.
//   4. Re-run: `npm run build:shiller-dataset`
//   5. Commit the regenerated public/data/shiller.json.
//
// The shape of public/data/shiller.json is the engine's contract. Don't
// change it without also updating src/features/fire-calculator/data-types.ts.
// ────────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'public', 'data', 'shiller.json');

// ── Types (mirror src/features/fire-calculator/data-types.ts) ──────────────
interface ShillerMonthlyRow {
  date: string; // yyyy-mm
  sp500RealReturnPct: number; // monthly real total return, percent
  bondRealReturnPct: number; // monthly real total return, percent
  cpi: number; // index level, normalized to 100 in 1982
  cape: number; // Shiller cyclically-adjusted PE
}

interface ShillerDataset {
  asOf: string;
  rows: ShillerMonthlyRow[];
  meta: {
    source: 'shiller-online' | 'synthetic-facsimile';
    sourceUrl: string;
    generatedAt: string;
    generatorScript: 'scripts/build-shiller-dataset.ts';
    note?: string;
  };
}

// ── Seeded PRNG (mulberry32) ───────────────────────────────────────────────
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMuller(rng: () => number): number {
  let u1 = rng();
  if (u1 === 0) u1 = 1e-12;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ── Famous historical bad sequences (approximate real annual S&P returns) ──
// Hand-keyed so the bootstrap's worst cases align with what a real Shiller
// dataset would produce. Values are real (inflation-adjusted) annual returns.
const FAMOUS_BAD_SEQUENCES: Record<number, number> = {
  1929: -0.085,
  1930: -0.255,
  1931: -0.437,
  1932: -0.085,
  // 1973-82 stagflation: returns + heavy inflation
  1973: -0.147,
  1974: -0.265,
  1977: -0.07,
  // dot-com bust
  2000: -0.091,
  2001: -0.119,
  2002: -0.221,
  // GFC
  2008: -0.37,
};

const FAMOUS_BAD_INFLATION: Record<number, number> = {
  // Great Depression deflation
  1930: -0.063,
  1931: -0.092,
  1932: -0.103,
  // Stagflation
  1973: 0.062,
  1974: 0.11,
  1979: 0.113,
  1980: 0.135,
  1981: 0.103,
};

// ── Generate one month ──────────────────────────────────────────────────────
function generateMonth(
  year: number,
  month: number,
  rng: () => number,
  cpiLevel: number,
  capeBase: number,
): { row: ShillerMonthlyRow; nextCpi: number; nextCape: number } {
  // Long-run targets calibrated to ~6.8% real S&P CAGR, ~2.5% real bond CAGR,
  // ~2.2% inflation, σ_stock ≈ 17% annualized, σ_bond ≈ 8%.
  const annualStockMean = 0.068;
  const annualStockStdev = 0.17;
  const annualBondMean = 0.025;
  const annualBondStdev = 0.075;
  const annualInflationMean = 0.022;
  const annualInflationStdev = 0.025;

  // Monthly equivalents (divide by 12 for mean, sqrt(12) for stdev).
  const monthlyStockMean = annualStockMean / 12;
  const monthlyStockStdev = annualStockStdev / Math.sqrt(12);
  const monthlyBondMean = annualBondMean / 12;
  const monthlyBondStdev = annualBondStdev / Math.sqrt(12);
  const monthlyInflationMean = annualInflationMean / 12;
  const monthlyInflationStdev = annualInflationStdev / Math.sqrt(12);

  // Famous-bad-year override: distribute the known annual return across the
  // 12 months, scaled by per-month draws so monthly variation still looks
  // organic.
  const badStock = FAMOUS_BAD_SEQUENCES[year];
  const badInfl = FAMOUS_BAD_INFLATION[year];

  let stockReal: number;
  if (badStock !== undefined) {
    // Distribute the annual figure with mild monthly noise.
    const baseline = badStock / 12;
    const noise = boxMuller(rng) * 0.03;
    stockReal = baseline + noise;
  } else {
    stockReal = monthlyStockMean + boxMuller(rng) * monthlyStockStdev;
  }

  const bondReal = monthlyBondMean + boxMuller(rng) * monthlyBondStdev;

  let inflation: number;
  if (badInfl !== undefined) {
    const baseline = badInfl / 12;
    const noise = boxMuller(rng) * 0.005;
    inflation = baseline + noise;
  } else {
    inflation = monthlyInflationMean + boxMuller(rng) * monthlyInflationStdev;
  }

  const nextCpi = cpiLevel * (1 + inflation);

  // CAPE: mean-reverting random walk around long-run mean 17, with current-
  // era drift toward mid-30s for recent years.
  const longRunCapeMean = 17;
  const recentEraDrift = year >= 2010 ? Math.min(20, (year - 2010) * 1.2) : 0;
  const capeTarget = longRunCapeMean + recentEraDrift;
  const meanReversion = (capeTarget - capeBase) * 0.02;
  const capeShock = boxMuller(rng) * 0.6;
  const nextCape = Math.max(5, Math.min(50, capeBase + meanReversion + capeShock));

  return {
    row: {
      date: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`,
      sp500RealReturnPct: round(stockReal * 100, 4),
      bondRealReturnPct: round(bondReal * 100, 4),
      cpi: round(cpiLevel, 3),
      cape: round(capeBase, 2),
    },
    nextCpi,
    nextCape,
  };
}

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// ── Generate the full series ────────────────────────────────────────────────
function generateRows(): ShillerMonthlyRow[] {
  const rng = mulberry32(0xa17f00d); // fixed seed for reproducibility
  const rows: ShillerMonthlyRow[] = [];
  let cpi = 12.5; // approximate CPI level in 1871 (rebased to 1982=100)
  let cape = 15.0;

  // 1871-01 through 2026-06 (= 1854 months)
  for (let year = 1871; year <= 2026; year++) {
    const endMonth = year === 2026 ? 6 : 12;
    for (let month = 1; month <= endMonth; month++) {
      const { row, nextCpi, nextCape } = generateMonth(year, month, rng, cpi, cape);
      rows.push(row);
      cpi = nextCpi;
      cape = nextCape;
    }
  }

  return rows;
}

const rows = generateRows();
const dataset: ShillerDataset = {
  asOf: rows[rows.length - 1].date,
  rows,
  meta: {
    source: 'synthetic-facsimile',
    sourceUrl: 'http://www.econ.yale.edu/~shiller/data.htm',
    generatedAt: new Date().toISOString(),
    generatorScript: 'scripts/build-shiller-dataset.ts',
    note: 'Placeholder facsimile calibrated to long-run US statistics with famous-bad-year overlays. Replace with parsed Shiller ie_data.xls for production-grade accuracy. See header comment in the generator script.',
  },
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(dataset) + '\n', 'utf8');

// eslint-disable-next-line no-console
console.log(
  `Wrote ${rows.length} monthly rows to public/data/shiller.json (as of ${dataset.asOf})`,
);
