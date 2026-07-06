// Anchor tests for the Bucket Strategy engine (spec §6).

import { describe, it, expect } from 'vitest';
import {
  simulateBucketStrategy,
  simulateOnePath,
  sampleEquityReturn,
} from '../engine';
import { effectiveStabilityTarget, isCrashSkip, nextSpending } from '../rules';
import { DEFAULT_BUCKET_PARAMS } from '../defaults';
import type { BucketParams } from '../types';

const base: BucketParams = { ...DEFAULT_BUCKET_PARAMS, numRuns: 200, seed: 12345 };

// mulberry32 for the standalone draw test.
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

// ─── T1 — cap logic: target never exceeds either rule ─────────────────────
describe('T1 — effectiveStabilityTarget cap logic', () => {
  it('years rule binds when the portfolio is large', () => {
    const target = effectiveStabilityTarget({
      stabilityYears: 5,
      annualExpenses: 60_000,
      capPct: 35,
      portfolio: 10_000_000,
    });
    // min(5×60k = 300k, 35%×10M = 3.5M) = 300k
    expect(target).toBe(300_000);
  });

  it('cap rule binds when the portfolio is small', () => {
    const target = effectiveStabilityTarget({
      stabilityYears: 8,
      annualExpenses: 60_000,
      capPct: 35,
      portfolio: 500_000,
    });
    // min(8×60k = 480k, 35%×500k = 175k) = 175k
    expect(target).toBe(175_000);
  });

  it('never exceeds either rule across a sweep', () => {
    for (let p = 100_000; p <= 5_000_000; p += 250_000) {
      const years = 6;
      const annual = 50_000;
      const capPct = 30;
      const target = effectiveStabilityTarget({ stabilityYears: years, annualExpenses: annual, capPct, portfolio: p });
      expect(target).toBeLessThanOrEqual(years * annual + 1e-6);
      expect(target).toBeLessThanOrEqual((capPct / 100) * p + 1e-6);
    }
  });
});

// ─── T2 — crash-skip fires AT the threshold ───────────────────────────────
describe('T2 — crash-skip threshold', () => {
  it('fires at exactly the threshold and beyond, not below', () => {
    expect(isCrashSkip(-0.15, 15)).toBe(true);
    expect(isCrashSkip(-0.2, 15)).toBe(true);
    expect(isCrashSkip(-0.149, 15)).toBe(false);
    expect(isCrashSkip(0.05, 15)).toBe(false);
  });

  it('skips the refill on a threshold-drop year but refills on a near miss', () => {
    const p: BucketParams = {
      ...base,
      horizonYears: 1,
      guardrailsEnabled: false,
      socialSecurityMonthly: 0,
      partTimeMonthly: 0,
    };
    const skip = simulateOnePath(p, { equityReturns: [-0.15], inflations: [0.028] })[0];
    const refill = simulateOnePath(p, { equityReturns: [-0.149], inflations: [0.028] })[0];

    expect(skip.skipped).toBe(true);
    expect(skip.refilled).toBe(false);
    expect(refill.skipped).toBe(false);
    expect(refill.refilled).toBe(true);
    // The refilled year tops the stability bucket up above the skipped year's.
    expect(refill.stability).toBeGreaterThan(skip.stability);
  });
});

// ─── T3 — guardrail cut & restore ─────────────────────────────────────────
describe('T3 — nextSpending cut / restore / freeze', () => {
  const infl = 0.028;

  it('cuts 10% when WR breaches the upper rail', () => {
    const { spending, cut } = nextSpending({
      currentSpending: 60_000,
      indexedBaselineNext: 61_680,
      inflation: infl,
      equityReturn: 0.1,
      withdrawalRate: 0.06, // > 5.2%
      params: base,
    });
    expect(cut).toBe(true);
    expect(spending).toBeCloseTo(60_000 * 1.028 * 0.9, 4); // 55,512
  });

  it('restores one step when WR falls below the lower rail', () => {
    const { spending, cut } = nextSpending({
      currentSpending: 50_000,
      indexedBaselineNext: 61_680,
      inflation: infl,
      equityReturn: 0.1,
      withdrawalRate: 0.03, // < 3.5%
      params: base,
    });
    expect(cut).toBe(false);
    expect(spending).toBeCloseTo((50_000 * 1.028) / 0.9, 3); // 57,111.11
  });

  it('caps the restore at the fully-indexed baseline', () => {
    const { spending } = nextSpending({
      currentSpending: 61_000,
      indexedBaselineNext: 61_680,
      inflation: infl,
      equityReturn: 0.1,
      withdrawalRate: 0.03,
      params: base,
    });
    expect(spending).toBe(61_680);
  });

  it('applies a plain inflation raise at a neutral WR', () => {
    const { spending, cut } = nextSpending({
      currentSpending: 60_000,
      indexedBaselineNext: 70_000,
      inflation: infl,
      equityReturn: 0.1,
      withdrawalRate: 0.045, // between rails
      params: base,
    });
    expect(cut).toBe(false);
    expect(spending).toBeCloseTo(61_680, 4);
  });

  it('freezes the raise after a negative equity year', () => {
    const { spending, cut } = nextSpending({
      currentSpending: 60_000,
      indexedBaselineNext: 70_000,
      inflation: infl,
      equityReturn: -0.05,
      withdrawalRate: 0.045,
      params: base,
    });
    expect(cut).toBe(false);
    expect(spending).toBe(60_000); // no raise
  });

  it('freeze and cut compound', () => {
    const { spending, cut } = nextSpending({
      currentSpending: 60_000,
      indexedBaselineNext: 70_000,
      inflation: infl,
      equityReturn: -0.05, // freeze
      withdrawalRate: 0.06, // cut
      params: base,
    });
    expect(cut).toBe(true);
    expect(spending).toBeCloseTo(54_000, 4); // 60k × 0.9
  });
});

// ─── T4 — Social Security offset + COLA independence ──────────────────────
describe('T4 — SS starts at offset year and is COLA-indexed independently', () => {
  it('SS is zero before the start year and pure COLA after, despite freezes/cuts', () => {
    const infl = 0.028;
    const p: BucketParams = {
      ...base,
      totalPortfolio: 3_000_000, // healthy so netW stays positive
      monthlyExpenses: 5_000,
      socialSecurityMonthly: 2_000,
      socialSecurityStartYear: 3,
      partTimeMonthly: 0,
      partTimeYears: 0,
      horizonYears: 8,
    };
    const equity = [0.1, -0.05, 0.2, -0.1, 0.15, -0.03, 0.08, 0.12];
    const path = simulateOnePath(p, {
      equityReturns: equity,
      inflations: new Array(8).fill(infl),
    });

    for (let t = 0; t < path.length; t++) {
      const portfolioStart = t === 0 ? p.totalPortfolio : path[t - 1].portfolioNominal;
      const netW = path[t].withdrawalRate * portfolioStart;
      const ssInferred = path[t].spending - netW; // part-time is 0
      const expected = t >= 3 ? 2_000 * 12 * Math.pow(1 + infl, t) : 0;
      expect(ssInferred).toBeCloseTo(expected, 2);
    }
  });
});

// ─── T5 — money conservation each step ────────────────────────────────────
describe('T5 — no money leaks', () => {
  const p: BucketParams = {
    ...base,
    horizonYears: 1,
    guardrailsEnabled: false,
    socialSecurityMonthly: 0,
    partTimeMonthly: 0,
  };
  // Initial S0 = 300k (min(5×60k, 35%×1.5M)), G0 = 1.2M, netW0 = 60k.
  const S0 = 300_000;
  const G0 = 1_200_000;
  const netW0 = 60_000;
  const rf = p.fixedIncomeReturnPct / 100;

  it('conserves through withdraw → returns → rebalance (normal year)', () => {
    const rE = 0.1;
    const step = simulateOnePath(p, { equityReturns: [rE], inflations: [0.028] })[0];
    const expected = (S0 - netW0) * (1 + rf) + G0 * (1 + rE);
    expect(step.portfolioNominal).toBeCloseTo(expected, 4);
  });

  it('conserves on a crash-skip year (no rebalance)', () => {
    const rE = -0.15;
    const step = simulateOnePath(p, { equityReturns: [rE], inflations: [0.028] })[0];
    const expected = (S0 - netW0) * (1 + rf) + G0 * (1 + rE);
    expect(step.portfolioNominal).toBeCloseTo(expected, 4);
  });
});

// ─── T6 — deterministic 2000 historical path snapshot ─────────────────────
describe('T6 — 2000 historical path', () => {
  it('matches the recorded snapshot', () => {
    const result = simulateBucketStrategy({ ...base, numRuns: 50 });
    const summary = result.historicalPath.map((y) => ({
      year: y.year,
      portfolioReal: Math.round(y.portfolioReal),
      refilled: y.refilled,
      skipped: y.skipped,
      cut: y.cut,
    }));
    expect(summary).toMatchSnapshot();
  });
});

// ─── T7 — lognormal calibration ───────────────────────────────────────────
describe('T7 — equity draw mean matches the input', () => {
  it('empirical mean of 50k draws ≈ 9.5%', () => {
    const rng = mulberry32(999);
    const N = 50_000;
    let sum = 0;
    for (let i = 0; i < N; i++) sum += sampleEquityReturn(rng, 9.5, 16);
    expect(sum / N).toBeCloseTo(0.095, 2);
  });
});
