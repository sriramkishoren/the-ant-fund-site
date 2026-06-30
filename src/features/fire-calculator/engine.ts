// FIRE engine — pure TypeScript, zero React imports. Runs in the Web Worker
// or in Vitest. Read docs/fire-calculator/SPEC.md before changing the API.

import type { ShillerDataset } from './data-types';
import { annualize, latestCape } from './dataset-loader';
import { createBootstrapSampler } from './bootstrap-sampler';
import { DEFAULT_BLOCK_SIZE_MONTHS } from './defaults';
import { mulberry32 } from './prng';
import { getRule } from './withdrawal-rules';
import type {
  PlanInput,
  PlanResult,
  YearlyDetailRow,
  YearlyPercentile,
} from './types';

// ─── Headline-tier helpers ────────────────────────────────────────────────

export function computeHeadline(args: {
  annualSpending: number;
  swr: number;
}): { fireNumber: number; multiple: number } {
  if (args.swr <= 0) {
    return { fireNumber: Number.POSITIVE_INFINITY, multiple: Number.POSITIVE_INFINITY };
  }
  const multiple = 1 / args.swr;
  const fireNumber = args.annualSpending * multiple;
  return { fireNumber, multiple };
}

/** Default SWR from current CAPE: min(0.04, 0.0175 + 0.5 × (1/CAPE)). */
export function defaultSwrFromCape(cape: number): number {
  if (cape <= 0) return 0.04;
  const raw = 0.0175 + 0.5 * (1 / cape);
  return Math.min(0.04, raw);
}

/** Coast FIRE future-value check. Pure helper, not part of the sim. */
export function computeCoastFire(args: {
  fullFireNumber: number;
  realReturn: number;
  yearsToTraditionalRetirement: number;
}): number {
  const { fullFireNumber, realReturn, yearsToTraditionalRetirement } = args;
  if (yearsToTraditionalRetirement <= 0) return fullFireNumber;
  return fullFireNumber / Math.pow(1 + realReturn, yearsToTraditionalRetirement);
}

// ─── Simulation core ──────────────────────────────────────────────────────

export interface RunOptions {
  onProgress?: (completed: number, total: number) => void;
  /** Emit progress every N sims. */
  progressEvery?: number;
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.floor(p * sortedAsc.length)));
  return sortedAsc[idx];
}

/**
 * Resolves a CashFlow stream into a per-sim-year nominal cash inflow.
 * sim year 0 = retirement year. Cash flow startYearOffset is years-from-TODAY.
 */
function buildCashFlowYearly(
  cashFlows: PlanInput['cashFlows'],
  yearsFromTodayToRetirement: number,
  horizonYears: number,
  cumulativeInflationByYear: Float64Array,
): Float64Array {
  const yearly = new Float64Array(horizonYears);
  for (const cf of cashFlows) {
    const simStart = cf.startYearOffset - yearsFromTodayToRetirement;
    const simEnd =
      cf.endYearOffset !== undefined
        ? cf.endYearOffset - yearsFromTodayToRetirement
        : horizonYears - 1;
    for (let y = Math.max(0, simStart); y <= Math.min(horizonYears - 1, simEnd); y++) {
      const realAmount = cf.annualAmount;
      // colaMode handling: convert real → nominal via cumulative inflation.
      let nominal: number;
      if (cf.colaMode === 'cpi') {
        nominal = realAmount * cumulativeInflationByYear[y];
      } else if (cf.colaMode === 'fraction') {
        const f = cf.colaFraction ?? 0;
        // Partial COLA: scale inflation by f.
        const partialInflation = 1 + (cumulativeInflationByYear[y] - 1) * f;
        nominal = realAmount * partialInflation;
      } else {
        // 'fixed' nominal — real value erodes over time. Convert today's
        // nominal to the year-y nominal: stays the same (fixed-nominal).
        nominal = realAmount;
      }
      yearly[y] += nominal;
    }
  }
  return yearly;
}

interface SinglePathResult {
  path: number[];
  terminal: number;
  depleted: boolean;
}

function simulateOnePath(
  input: PlanInput,
  rule: ReturnType<typeof getRule>,
  yearDraws: ReturnType<ReturnType<typeof createBootstrapSampler>>,
  yearsFromTodayToRetirement: number,
  forceLtcShock: boolean,
): SinglePathResult {
  const { portfolio, annualSpending, allocation, withdrawalRule, cashFlows, horizonYears } =
    input;

  const path: number[] = new Array(horizonYears + 1);
  path[0] = portfolio;
  let value = portfolio;
  let depleted = false;

  // Pre-compute cumulative inflation per year and cash-flow inflows.
  const cumInflation = new Float64Array(horizonYears);
  let infl = 1;
  for (let y = 0; y < horizonYears; y++) {
    infl *= 1 + yearDraws[y].inflation;
    cumInflation[y] = infl;
  }
  const yearlyCashIn = buildCashFlowYearly(
    cashFlows,
    yearsFromTodayToRetirement,
    horizonYears,
    cumInflation,
  );

  // Rule per-path state lives inside ruleParams; clone so paths don't share.
  const ruleParams: Record<string, number> = { ...(withdrawalRule.params ?? {}) };

  for (let y = 0; y < horizonYears; y++) {
    if (depleted) {
      path[y + 1] = 0;
      continue;
    }

    // Inject cash flows first (they're available to spend or grow this year).
    value += yearlyCashIn[y];

    // Determine this year's withdrawal via the rule.
    const withdrawal = rule.compute({
      yearIndex: y,
      age: input.retirementAge + y,
      portfolioValue: value,
      inflationToDate: cumInflation[y],
      initialRate: withdrawalRule.initialRate,
      baseRealSpending: annualSpending,
      cashFlowsThisYear: yearlyCashIn[y],
      remainingHorizonYears: horizonYears - y,
      params: ruleParams,
    });

    // Optional LTC shock — lumpy expense in the last 10% of the horizon (one
    // specific year for determinism). Roughly 2× annual spending.
    let ltcExtra = 0;
    if (forceLtcShock) {
      const shockYear = Math.floor(horizonYears * 0.92);
      if (y === shockYear) ltcExtra = annualSpending * cumInflation[y] * 2;
    }

    value -= withdrawal + ltcExtra;
    if (value <= 0) {
      value = 0;
      depleted = true;
      path[y + 1] = 0;
      continue;
    }

    // Apply portfolio-weighted real return.
    const r =
      allocation.stocks * yearDraws[y].stockRealReturn +
      allocation.bonds * yearDraws[y].bondRealReturn +
      allocation.cash * 0; // cash earns ~zero real
    value *= 1 + r;
    if (value < 0) {
      value = 0;
      depleted = true;
    }

    path[y + 1] = value;
  }

  return { path, terminal: value, depleted };
}

function buildDetailRows(path: number[], input: PlanInput): YearlyDetailRow[] {
  // The engine recorded only the end-of-year portfolio values; cash flows and
  // withdrawals are deterministic-ish but rule-dependent, so growth must be
  // reverse-engineered from values + a recomputed cashflow.
  const rows: YearlyDetailRow[] = [];
  for (let y = 0; y < path.length - 1; y++) {
    rows.push({
      age: input.retirementAge + y,
      yearOffset: y,
      startValue: path[y],
      // We don't reconstruct the precise per-year cashflow here — the detail
      // tables are primarily a UX device. Show the net change as the
      // year's combined movement.
      cashflow: 0,
      growth: path[y + 1] - path[y],
      endValue: path[y + 1],
      phase: 'decumulation',
    });
  }
  return rows;
}

// ─── Public driver ────────────────────────────────────────────────────────

export function runFireSimulation(
  input: PlanInput,
  dataset: ShillerDataset,
  opts: RunOptions = {},
): PlanResult {
  const {
    onProgress,
    progressEvery = Math.max(500, Math.floor(input.numSims / 20)),
  } = opts;

  const seed = input.seed ?? ((Date.now() & 0xffffffff) >>> 0);
  const rng = mulberry32(seed);
  const annualRows = annualize(dataset);
  const blockSizeYears = Math.ceil(DEFAULT_BLOCK_SIZE_MONTHS / 12);

  const sampler = createBootstrapSampler({
    annualRows,
    blockSizeYears,
    rng,
    forceBadFirstYears: input.stress?.forceBadFirstYears ?? false,
  });

  const yearsFromTodayToRetirement = Math.max(0, input.retirementAge - input.currentAge);
  const rule = getRule(input.withdrawalRule.kind);

  const N = input.numSims;
  const H = input.horizonYears;
  const flat = new Float64Array(N * (H + 1));
  const terminals = new Float64Array(N);
  const depletedFlags = new Uint8Array(N);

  for (let s = 0; s < N; s++) {
    const yearDraws = sampler(H);
    const { path, terminal, depleted } = simulateOnePath(
      input,
      rule,
      yearDraws,
      yearsFromTodayToRetirement,
      input.stress?.longTermCareShock ?? false,
    );
    const base = s * (H + 1);
    for (let y = 0; y <= H; y++) flat[base + y] = path[y];
    terminals[s] = terminal;
    depletedFlags[s] = depleted ? 1 : 0;

    if (onProgress && (s + 1) % progressEvery === 0) onProgress(s + 1, N);
  }
  if (onProgress) onProgress(N, N);

  // ─── Aggregate per-year percentiles ───────────────────────────────────
  const percentiles: YearlyPercentile[] = [];
  const bucket = new Float64Array(N);
  for (let y = 0; y <= H; y++) {
    for (let s = 0; s < N; s++) bucket[s] = flat[s * (H + 1) + y];
    const sorted = Array.from(bucket).sort((a, b) => a - b);
    percentiles.push({
      age: input.retirementAge + y,
      yearOffset: y,
      p10: percentile(sorted, 0.1),
      p25: percentile(sorted, 0.25),
      p50: percentile(sorted, 0.5),
      p75: percentile(sorted, 0.75),
      p90: percentile(sorted, 0.9),
    });
  }

  // ─── Sample paths overlay (100 evenly-spaced) ─────────────────────────
  const sampleCount = Math.min(100, N);
  const step = Math.max(1, Math.floor(N / sampleCount));
  const samplePaths: number[][] = [];
  for (let s = 0; s < N && samplePaths.length < sampleCount; s += step) {
    const base = s * (H + 1);
    const p: number[] = new Array(H + 1);
    for (let y = 0; y <= H; y++) p[y] = flat[base + y];
    samplePaths.push(p);
  }

  // ─── Summary stats ────────────────────────────────────────────────────
  const successCount = depletedFlags.reduce((acc, d) => acc + (d === 0 ? 1 : 0), 0);
  const successProbability = successCount / N;

  // Headline: use the rule's initialRate.
  const headline = computeHeadline({
    annualSpending: input.annualSpending,
    swr: input.withdrawalRule.initialRate,
  });

  // ─── Detail paths for the median, p10, p90 by terminal value ──────────
  const sortedTerm = [...Array.from(terminals)].sort((a, b) => a - b);
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
    const base = bestIdx * (H + 1);
    const out: number[] = new Array(H + 1);
    for (let y = 0; y <= H; y++) out[y] = flat[base + y];
    return out;
  }
  const detailPaths = {
    median: buildDetailRows(pathForPercentile(0.5), input),
    p10: buildDetailRows(pathForPercentile(0.1), input),
    p90: buildDetailRows(pathForPercentile(0.9), input),
  };

  const cape = input.capeOverride ?? latestCape(dataset).value;
  const capeAsOf = latestCape(dataset).asOf;

  return {
    fireNumber: headline.fireNumber,
    usedSwr: input.withdrawalRule.initialRate,
    multiple: headline.multiple,
    successProbability,
    percentiles,
    samplePaths,
    detailPaths,
    meta: {
      runs: N,
      seed,
      capeUsed: cape,
      capeAsOf,
      withdrawalRule: input.withdrawalRule.kind,
      horizonYears: H,
      blockSize: blockSizeYears,
    },
  };
}
