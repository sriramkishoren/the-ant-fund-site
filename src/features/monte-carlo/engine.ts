// Pure Monte Carlo retirement engine. No React, no DOM, no globals — so the
// Web Worker can import it and unit tests can drive it directly.

import type {
  HistogramBin,
  SimInputs,
  SimResult,
  YearlyDetailRow,
  YearlyPercentile,
} from './types';

// ── PRNG ────────────────────────────────────────────────────────────────────
// mulberry32: a small, fast, seedable 32-bit PRNG. Plenty of randomness for
// a retirement simulation; not a CSPRNG.
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

// Box-Muller transform: two uniform draws → one standard normal draw.
function boxMuller(rng: () => number): number {
  // Guard against log(0).
  let u1 = rng();
  if (u1 === 0) u1 = 1e-12;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ── Single-run simulator ────────────────────────────────────────────────────
interface SinglePathResult {
  path: number[];
  terminal: number;
  depleted: boolean;
  depletionAge: number | null;
}

function simulateOnePath(inputs: SimInputs, rng: () => number): SinglePathResult {
  const {
    currentAge,
    retirementAge,
    currentValue,
    monthlyContribution,
    contributionIncreasePct,
    inflationPct,
    expectedReturnPct,
    returnStdevPct,
    annualWithdrawal,
    withdrawalStrategy,
    withdrawalPct,
    lifeExpectancy,
  } = inputs;

  const mean = expectedReturnPct / 100;
  const stdev = returnStdevPct / 100;
  const infl = inflationPct / 100;
  const contribGrowth = contributionIncreasePct / 100;
  const wPct = withdrawalPct / 100;

  const years = lifeExpectancy - currentAge;
  const path: number[] = new Array(years + 1);
  path[0] = currentValue;

  let value = currentValue;
  let depleted = false;
  let depletionAge: number | null = null;

  for (let i = 0; i < years; i++) {
    const age = currentAge + i;
    const isAccum = age < retirementAge;

    if (depleted) {
      // Once depleted, stay at zero for the rest of the path.
      path[i + 1] = 0;
      continue;
    }

    const z = boxMuller(rng);
    const r = mean + stdev * z;

    if (isAccum) {
      // Grow this year, then add the year's contribution.
      value = value * (1 + r);
      const annualContribution = monthlyContribution * 12 * Math.pow(1 + contribGrowth, i);
      value += annualContribution;
    } else {
      // Withdraw first (so the year's spending isn't subject to mid-year return),
      // then apply the random return on the surviving balance.
      let withdrawal: number;
      if (withdrawalStrategy === 'fixed-real') {
        withdrawal = annualWithdrawal * Math.pow(1 + infl, i);
      } else if (withdrawalStrategy === 'fixed-nominal') {
        withdrawal = annualWithdrawal;
      } else {
        withdrawal = Math.max(0, value * wPct);
      }
      value -= withdrawal;
      if (value <= 0) {
        value = 0;
        depleted = true;
        depletionAge = age + 1; // depletion happens at the end of this year
      } else {
        value = value * (1 + r);
        if (value < 0) {
          value = 0;
          depleted = true;
          depletionAge = age + 1;
        }
      }
    }

    path[i + 1] = value;
  }

  return {
    path,
    terminal: value,
    depleted,
    depletionAge,
  };
}

// ── Stats helpers ───────────────────────────────────────────────────────────
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[idx];
}

// Build histogram with success/failure split. Bin edges are derived from the
// quantile range of terminal values, padded a bit, to avoid one bar swallowing
// everything when a few runs blow up to enormous terminal values.
function buildHistogram(
  terminals: number[],
  depletedFlags: boolean[],
  binCount = 20,
): HistogramBin[] {
  if (terminals.length === 0) return [];

  // Use p2..p98 of terminal values to size the bins; clamp outliers into the
  // first/last bin so the chart remains readable.
  const sorted = [...terminals].sort((a, b) => a - b);
  const min = 0;
  const max = Math.max(percentile(sorted, 0.98), sorted[sorted.length - 1] * 0.4, 1);

  const width = (max - min) / binCount;
  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    bins.push({
      binStart: min + i * width,
      binEnd: min + (i + 1) * width,
      successCount: 0,
      failureCount: 0,
    });
  }

  for (let i = 0; i < terminals.length; i++) {
    const v = terminals[i];
    let idx = Math.floor((v - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= binCount) idx = binCount - 1;
    if (depletedFlags[i]) {
      bins[idx].failureCount += 1;
    } else {
      bins[idx].successCount += 1;
    }
  }

  return bins;
}

// Re-derive a detail table (year by year, with start/cashflow/growth/end columns)
// from a single saved path. Cash flows are deterministic functions of year and
// the inputs, so growth = endValue - startValue - cashflow.
function buildDetailRows(path: number[], inputs: SimInputs): YearlyDetailRow[] {
  const {
    currentAge,
    retirementAge,
    monthlyContribution,
    contributionIncreasePct,
    inflationPct,
    annualWithdrawal,
    withdrawalStrategy,
    withdrawalPct,
  } = inputs;

  const infl = inflationPct / 100;
  const contribGrowth = contributionIncreasePct / 100;
  const wPct = withdrawalPct / 100;

  const rows: YearlyDetailRow[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const age = currentAge + i;
    const phase: YearlyDetailRow['phase'] = age < retirementAge ? 'accumulation' : 'decumulation';
    const startValue = path[i];
    const endValue = path[i + 1];

    let cashflow = 0;
    if (phase === 'accumulation') {
      cashflow = monthlyContribution * 12 * Math.pow(1 + contribGrowth, i);
    } else {
      let withdrawal: number;
      if (withdrawalStrategy === 'fixed-real') {
        withdrawal = annualWithdrawal * Math.pow(1 + infl, i);
      } else if (withdrawalStrategy === 'fixed-nominal') {
        withdrawal = annualWithdrawal;
      } else {
        // For percent-of-portfolio, the actual withdrawal depended on the
        // start-of-year value; reconstruct deterministically.
        withdrawal = Math.max(0, startValue * wPct);
      }
      cashflow = -withdrawal;
    }

    // growth = (end - start - cashflow). For the accumulation phase that's the
    // investment return on (start). For decumulation it's the return on
    // (start + cashflow) since cashflow is negative there.
    const growth = endValue - startValue - cashflow;

    rows.push({
      age,
      yearOffset: i,
      startValue,
      cashflow,
      growth,
      endValue,
      phase,
    });
  }
  return rows;
}

// ── Public API ──────────────────────────────────────────────────────────────
export interface RunOptions {
  onProgress?: (completed: number, total: number) => void;
  /** Emit a progress callback every N simulations. */
  progressEvery?: number;
}

export function runSimulation(inputs: SimInputs, opts: RunOptions = {}): SimResult {
  const { onProgress, progressEvery = Math.max(500, Math.floor(inputs.numSims / 20)) } = opts;

  // Seed: explicit if provided, otherwise derive from current time so each
  // press of "Run" yields a fresh outcome.
  const seed = inputs.seed ?? ((Date.now() & 0xffffffff) >>> 0);
  const rng = mulberry32(seed);

  const N = inputs.numSims;
  const years = inputs.lifeExpectancy - inputs.currentAge;

  // Pre-allocate all paths in a flat typed array for memory efficiency:
  // allPaths[s * (years+1) + y] = value at year y of simulation s.
  const allPaths = new Float64Array(N * (years + 1));
  const terminals = new Float64Array(N);
  const depleted = new Uint8Array(N);
  const depletionAges = new Float64Array(N);

  for (let s = 0; s < N; s++) {
    const { path, terminal, depleted: dep, depletionAge } = simulateOnePath(inputs, rng);
    const base = s * (years + 1);
    for (let y = 0; y <= years; y++) {
      allPaths[base + y] = path[y];
    }
    terminals[s] = terminal;
    depleted[s] = dep ? 1 : 0;
    depletionAges[s] = depletionAge ?? Number.NaN;

    if (onProgress && (s + 1) % progressEvery === 0) {
      onProgress(s + 1, N);
    }
  }
  if (onProgress) onProgress(N, N);

  // Per-year percentiles
  const yearlyPercentiles: YearlyPercentile[] = [];
  const bucket = new Float64Array(N);
  for (let y = 0; y <= years; y++) {
    for (let s = 0; s < N; s++) bucket[s] = allPaths[s * (years + 1) + y];
    const sorted = Array.from(bucket).sort((a, b) => a - b);
    yearlyPercentiles.push({
      age: inputs.currentAge + y,
      yearOffset: y,
      p10: percentile(sorted, 0.1),
      p25: percentile(sorted, 0.25),
      p50: percentile(sorted, 0.5),
      p75: percentile(sorted, 0.75),
      p90: percentile(sorted, 0.9),
    });
  }

  // Sample paths for the overlay — 100 evenly-spaced, deterministic samples
  // (so consecutive runs of the same seed produce the same overlay).
  const sampleCount = Math.min(100, N);
  const samplePaths: number[][] = [];
  const step = Math.max(1, Math.floor(N / sampleCount));
  for (let s = 0; s < N && samplePaths.length < sampleCount; s += step) {
    const base = s * (years + 1);
    const p: number[] = new Array(years + 1);
    for (let y = 0; y <= years; y++) p[y] = allPaths[base + y];
    samplePaths.push(p);
  }

  // Summary stats on terminal values
  const termArr = Array.from(terminals);
  const sortedTerm = [...termArr].sort((a, b) => a - b);
  const successRuns = depleted.reduce((acc, d) => acc + (d === 0 ? 1 : 0), 0);
  const successRate = successRuns / N;
  const failureRate = 1 - successRate;
  const medianTerminal = percentile(sortedTerm, 0.5);
  const p10Terminal = percentile(sortedTerm, 0.1);
  const p90Terminal = percentile(sortedTerm, 0.9);

  // Median depletion age, if any depleted runs
  let medianDepletionAge: number | null = null;
  const depletionList: number[] = [];
  for (let s = 0; s < N; s++) {
    if (depleted[s] === 1 && !Number.isNaN(depletionAges[s])) {
      depletionList.push(depletionAges[s]);
    }
  }
  if (depletionList.length > 0) {
    depletionList.sort((a, b) => a - b);
    medianDepletionAge = depletionList[Math.floor(depletionList.length / 2)];
  }

  // Histogram
  const terminalHistogram = buildHistogram(termArr, Array.from(depleted).map((d) => d === 1));

  // Year-by-year detail for median, p10, p90 paths — find the path whose
  // terminal value matches each percentile.
  function pathForPercentile(p: number): number[] {
    const target = percentile(sortedTerm, p);
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let s = 0; s < N; s++) {
      const diff = Math.abs(terminals[s] - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = s;
      }
    }
    const base = bestIdx * (years + 1);
    const out: number[] = new Array(years + 1);
    for (let y = 0; y <= years; y++) out[y] = allPaths[base + y];
    return out;
  }

  const detailPaths = {
    median: buildDetailRows(pathForPercentile(0.5), inputs),
    p10: buildDetailRows(pathForPercentile(0.1), inputs),
    p90: buildDetailRows(pathForPercentile(0.9), inputs),
  };

  return {
    samplePaths,
    yearlyPercentiles,
    terminalHistogram,
    successRate,
    failureRate,
    medianTerminal,
    p10Terminal,
    p90Terminal,
    medianDepletionAge,
    detailPaths,
    meta: {
      runs: N,
      startAge: inputs.currentAge,
      endAge: inputs.lifeExpectancy,
      seed,
    },
  };
}
