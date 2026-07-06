// Pure two-bucket retirement engine. No React, no DOM, no globals — the Web
// Worker imports it and the tests drive it directly.
//
// Each year (spec §3): withdraw net expenses from the stability bucket (force
// sell growth if empty) → apply returns → decide next year's spending under the
// guardrails → refill/rebalance the stability bucket unless a crash-skip fires.

import { effectiveStabilityTarget, isCrashSkip, nextSpending } from './rules';
import { HISTORICAL_US } from './historical-us';
import type {
  BucketParams,
  HistoricalYear,
  PercentileBand,
  SimulationResult,
} from './types';

// ── PRNG (mulberry32 + Box-Muller), same family as the other engines ─────────
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

/**
 * Lognormal parameters calibrated so a simple annual return R = e^X − 1 has
 * arithmetic mean = meanPct and stdev = volPct (both on simple returns).
 */
function lognormalParams(meanPct: number, volPct: number): { mu: number; sigma: number } {
  const m = meanPct / 100;
  const s = volPct / 100;
  const sigma2 = Math.log(1 + (s * s) / ((1 + m) * (1 + m)));
  const mu = Math.log(1 + m) - sigma2 / 2;
  return { mu, sigma: Math.sqrt(sigma2) };
}

/** One calibrated lognormal simple-return draw. Exported for the mean test. */
export function sampleEquityReturn(rng: () => number, meanPct: number, volPct: number): number {
  const { mu, sigma } = lognormalParams(meanPct, volPct);
  return Math.exp(mu + sigma * boxMuller(rng)) - 1;
}

// ── One path ─────────────────────────────────────────────────────────────
// Rich per-year record. HistoricalYear-shaped plus a couple of internal-only
// fields the aggregator reads.
interface PathStep {
  yearIndex: number;
  equityReturn: number;
  inflation: number;
  stability: number;
  growth: number;
  portfolioNominal: number;
  portfolioReal: number;
  spending: number;
  spendingReal: number;
  withdrawalRate: number;
  refilled: boolean;
  skipped: boolean;
  cut: boolean;
}

interface InitialAllocation {
  stability: number;
  growth: number;
  target: number;
  withdrawalRate: number;
}

function initialAllocation(params: BucketParams): InitialAllocation {
  const annual = params.monthlyExpenses * 12;
  const target = effectiveStabilityTarget({
    stabilityYears: params.stabilityYears,
    annualExpenses: annual,
    capPct: params.stabilityCapPct,
    portfolio: params.totalPortfolio,
  });
  const stability = Math.min(target, params.totalPortfolio);
  const growth = params.totalPortfolio - stability;
  const ss0 = params.socialSecurityStartYear <= 0 ? params.socialSecurityMonthly * 12 : 0;
  const pt0 = params.partTimeYears > 0 ? params.partTimeMonthly * 12 : 0;
  const netW0 = Math.max(0, annual - ss0 - pt0);
  const withdrawalRate = params.totalPortfolio > 0 ? netW0 / params.totalPortfolio : 0;
  return { stability, growth, target, withdrawalRate };
}

/**
 * Simulate one path given explicit equity-return and inflation series (length =
 * number of years). Shared by the deterministic historical path, the Monte
 * Carlo runs, and the unit tests.
 */
function computePath(
  params: BucketParams,
  equityReturns: number[],
  inflations: number[],
): PathStep[] {
  const years = equityReturns.length;
  const rf = params.fixedIncomeReturnPct / 100;

  const init = initialAllocation(params);
  let S = init.stability;
  let G = init.growth;
  const annual0 = params.monthlyExpenses * 12;
  let A = annual0; // actual spending this year
  let B = annual0; // fully-indexed baseline
  let cumInfl = 1; // product of (1+inflation) for elapsed years
  let failed = false;

  const steps: PathStep[] = [];

  for (let t = 0; t < years; t++) {
    const rE = equityReturns[t];
    const infl = inflations[t];

    // Income (SS is COLA-indexed by cumulative inflation, independent of any
    // spending freeze/cut; part-time is flat/nominal and short-term).
    const ss = t >= params.socialSecurityStartYear ? params.socialSecurityMonthly * 12 * cumInfl : 0;
    const pt = t < params.partTimeYears ? params.partTimeMonthly * 12 : 0;
    const netW = Math.max(0, A - ss - pt);

    const portfolioStart = S + G;
    const WR = portfolioStart > 0 ? netW / portfolioStart : 0;

    // Step 1 — withdraw from stability, force-sell growth on shortfall.
    let remaining = netW;
    if (S >= remaining) {
      S -= remaining;
      remaining = 0;
    } else {
      remaining -= S;
      S = 0;
      if (G >= remaining) {
        G -= remaining;
        remaining = 0;
      } else {
        remaining -= G;
        G = 0;
        failed = true;
      }
    }

    // Step 2 — returns.
    G = G * (1 + rE);
    S = S * (1 + rf);

    // Step 3 — next year's spending.
    const Bnext = B * (1 + infl);
    const { spending: Anext, cut } = nextSpending({
      currentSpending: A,
      indexedBaselineNext: Bnext,
      inflation: infl,
      equityReturn: rE,
      withdrawalRate: WR,
      params,
    });

    // Step 4 — refill / two-way rebalance, unless a crash-skip fires.
    const skipped = isCrashSkip(rE, params.crashSkipThresholdPct);
    let refilled = false;
    if (!skipped && !failed) {
      const portfolioNow = S + G;
      const target = effectiveStabilityTarget({
        stabilityYears: params.stabilityYears,
        annualExpenses: Anext,
        capPct: params.stabilityCapPct,
        portfolio: portfolioNow,
      });
      if (S < target) {
        const need = Math.min(target - S, G);
        S += need;
        G -= need;
        refilled = need > 0;
      } else if (S > target) {
        const excess = S - target;
        S -= excess;
        G += excess;
        refilled = excess > 0;
      }
    }

    // Deflation: start-of-year factor for spending, end-of-year for portfolio.
    const deflStart = cumInfl;
    cumInfl = cumInfl * (1 + infl);
    const portfolioNominal = S + G;

    steps.push({
      yearIndex: t,
      equityReturn: rE,
      inflation: infl,
      stability: S,
      growth: G,
      portfolioNominal,
      portfolioReal: portfolioNominal / cumInfl,
      spending: A,
      spendingReal: A / deflStart,
      withdrawalRate: WR,
      refilled,
      skipped,
      cut,
    });

    A = Anext;
    B = Bnext;
  }

  return steps;
}

function toHistoricalYear(step: PathStep, calendarYear: number): HistoricalYear {
  return {
    year: calendarYear,
    yearIndex: step.yearIndex,
    equityReturn: step.equityReturn,
    inflation: step.inflation,
    stability: step.stability,
    growth: step.growth,
    portfolioNominal: step.portfolioNominal,
    portfolioReal: step.portfolioReal,
    spending: step.spending,
    withdrawalRate: step.withdrawalRate,
    refilled: step.refilled,
    skipped: step.skipped,
    cut: step.cut,
  };
}

/**
 * Public single-path runner for tests. Uses the supplied series; labels years
 * by 0-based index.
 */
export function simulateOnePath(
  params: BucketParams,
  series: { equityReturns: number[]; inflations: number[] },
): HistoricalYear[] {
  const steps = computePath(params, series.equityReturns, series.inflations);
  return steps.map((s) => toHistoricalYear(s, s.yearIndex));
}

function historicalPath(params: BucketParams): HistoricalYear[] {
  const equityReturns = HISTORICAL_US.map((r) => r.sp500TotalReturn);
  const inflations = HISTORICAL_US.map((r) => r.cpiInflation);
  const steps = computePath(params, equityReturns, inflations);
  return steps.map((s, i) => toHistoricalYear(s, HISTORICAL_US[i].year));
}

// ── Aggregation helpers ────────────────────────────────────────────────────
function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.floor(p * sortedAsc.length)));
  return sortedAsc[idx];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function bandsFromColumns(columns: number[][]): PercentileBand[] {
  return columns.map((col, year) => {
    const sorted = [...col].sort((a, b) => a - b);
    return {
      year,
      p10: percentile(sorted, 0.1),
      p25: percentile(sorted, 0.25),
      p50: percentile(sorted, 0.5),
      p75: percentile(sorted, 0.75),
      p90: percentile(sorted, 0.9),
    };
  });
}

export interface RunOptions {
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Monte Carlo over `numRuns` paths plus the deterministic 2000–2025 historical
 * path. Returns aggregated percentile bands (real + nominal) and summary stats.
 */
export function simulateBucketStrategy(
  params: BucketParams,
  opts: RunOptions = {},
): SimulationResult {
  const H = params.horizonYears;
  const runs = params.numRuns;
  const seed = params.seed ?? 0x9e3779b1;
  const rng = mulberry32(seed);
  const infl = params.inflationPct / 100;
  const inflations = new Array<number>(H).fill(infl);

  // Column-per-year collections (index 0 = start, anchored at totalPortfolio).
  const nominalCols: number[][] = Array.from({ length: H + 1 }, () => []);
  const realCols: number[][] = Array.from({ length: H + 1 }, () => []);
  const cutYears: number[] = [];
  const finalRealSpending: number[] = [];
  let successCount = 0;

  const progressEvery = Math.max(1, Math.floor(runs / 50));

  for (let r = 0; r < runs; r++) {
    const equityReturns = new Array<number>(H);
    for (let t = 0; t < H; t++) {
      equityReturns[t] = sampleEquityReturn(rng, params.equityReturnPct, params.equityVolPct);
    }
    const steps = computePath(params, equityReturns, inflations);

    nominalCols[0].push(params.totalPortfolio);
    realCols[0].push(params.totalPortfolio);
    let cuts = 0;
    for (let t = 0; t < H; t++) {
      nominalCols[t + 1].push(steps[t].portfolioNominal);
      realCols[t + 1].push(steps[t].portfolioReal);
      if (steps[t].cut) cuts++;
    }
    cutYears.push(cuts);
    finalRealSpending.push(steps[H - 1].spendingReal);
    if (steps[H - 1].portfolioNominal > 0) successCount++;

    if (opts.onProgress && (r % progressEvery === 0 || r === runs - 1)) {
      opts.onProgress(r + 1, runs);
    }
  }

  const init = initialAllocation(params);

  return {
    successRate: runs > 0 ? successCount / runs : 0,
    effectiveStabilityTarget: init.target,
    initialStability: init.stability,
    initialGrowth: init.growth,
    initialWithdrawalRate: init.withdrawalRate,
    bandsReal: bandsFromColumns(realCols),
    bandsNominal: bandsFromColumns(nominalCols),
    medianYearsOfCuts: median(cutYears),
    medianFinalRealSpending: median(finalRealSpending),
    baselineFinalRealSpending: params.monthlyExpenses * 12,
    historicalPath: historicalPath(params),
    meta: { runs, horizonYears: H, seed },
  };
}
