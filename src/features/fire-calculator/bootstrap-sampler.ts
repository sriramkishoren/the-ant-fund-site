// Historical block-bootstrap sampler. Resamples 5-year blocks of (stock,
// bond, inflation) jointly so the real-world correlation between asset returns
// and inflation is preserved — the single most important accuracy choice in
// the engine (cf. docs/fire-calculator/SPEC.md §4.4).
//
// Important: never use Math.random() here. The sampler takes an injected RNG
// so test runs are reproducible from a seed.

import type { AnnualizedRow } from './dataset-loader';
import { randInt } from './prng';

export interface YearDraw {
  stockRealReturn: number;
  bondRealReturn: number;
  inflation: number;
}

export interface SamplerOptions {
  /** Annual rows in chronological order; output of annualize(). */
  annualRows: AnnualizedRow[];
  /** Block length in years. SPEC default is 5. */
  blockSizeYears: number;
  /** Seedable random source. */
  rng: () => number;
  /** Force the first 5 years of each draw from a historically-bad window. */
  forceBadFirstYears?: boolean;
}

/** Create a sampler that yields a fresh N-year sequence each call. */
export function createBootstrapSampler(opts: SamplerOptions): (years: number) => YearDraw[] {
  const { annualRows, blockSizeYears, rng, forceBadFirstYears = false } = opts;
  if (annualRows.length < blockSizeYears + 1) {
    throw new Error(
      `Bootstrap sampler needs at least ${blockSizeYears + 1} annual rows; got ${annualRows.length}.`,
    );
  }

  const N = annualRows.length;
  // Number of valid block start indices (so a full block fits without wrap).
  const validStarts = N - blockSizeYears + 1;

  // Pre-identify "bad" block start years for the stress toggle. Returns the
  // index of the first row whose .year matches; falls back to the single
  // worst 5-year window by compound return if the famous years aren't in the
  // dataset.
  const BAD_START_YEARS = [1929, 1973, 1966, 2000, 2007];
  const badStartIndices: number[] = [];
  for (const y of BAD_START_YEARS) {
    const idx = annualRows.findIndex((r) => r.year === y);
    if (idx >= 0 && idx + blockSizeYears <= N) badStartIndices.push(idx);
  }
  if (badStartIndices.length === 0) {
    // Pick the worst 5-year compound return.
    let worstIdx = 0;
    let worstFactor = Infinity;
    for (let i = 0; i <= N - blockSizeYears; i++) {
      let f = 1;
      for (let k = 0; k < blockSizeYears; k++) f *= 1 + annualRows[i + k].stockRealReturn;
      if (f < worstFactor) {
        worstFactor = f;
        worstIdx = i;
      }
    }
    badStartIndices.push(worstIdx);
  }

  function blockAt(startIdx: number): YearDraw[] {
    const block: YearDraw[] = new Array(blockSizeYears);
    for (let k = 0; k < blockSizeYears; k++) {
      const r = annualRows[startIdx + k];
      block[k] = {
        stockRealReturn: r.stockRealReturn,
        bondRealReturn: r.bondRealReturn,
        inflation: r.inflation,
      };
    }
    return block;
  }

  return function draw(years: number): YearDraw[] {
    const out: YearDraw[] = new Array(years);
    let written = 0;

    if (forceBadFirstYears) {
      const startIdx = badStartIndices[randInt(rng, badStartIndices.length)];
      const block = blockAt(startIdx);
      const take = Math.min(blockSizeYears, years);
      for (let k = 0; k < take; k++) out[written++] = block[k];
    }

    while (written < years) {
      const startIdx = randInt(rng, validStarts);
      const block = blockAt(startIdx);
      const take = Math.min(blockSizeYears, years - written);
      for (let k = 0; k < take; k++) out[written++] = block[k];
    }

    return out;
  };
}
