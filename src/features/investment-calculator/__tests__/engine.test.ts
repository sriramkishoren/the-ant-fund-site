// Anchor tests for the Investment Calculator engine. Each documents a known
// closed-form result or a round-trip through a solver.

import { describe, it, expect } from 'vitest';
import {
  computeInvestment,
  effectiveAnnualRate,
  solveContribution,
  solveReturn,
  solveStartingAmount,
  solveTime,
} from '../engine';
import type { InvestmentInput } from '../types';

const base: InvestmentInput = {
  startingAmount: 0,
  contribution: 0,
  contributionFrequency: 'annually',
  contributionTiming: 'end',
  annualReturn: 0,
  years: 10,
  compounding: 'annually',
};

// ─── T1 — lump sum, annual compounding, no contributions ──────────────────
describe('T1 — lump sum growth', () => {
  it('grows $1,000 at 10% for 10 years to 1000·1.1^10', () => {
    const r = computeInvestment({
      ...base,
      startingAmount: 1000,
      annualReturn: 0.1,
    });
    expect(r.endBalance).toBeCloseTo(1000 * Math.pow(1.1, 10), 6);
    expect(r.totalContributions).toBe(0);
    expect(r.totalInterest).toBeCloseTo(r.endBalance - 1000, 6);
  });
});

// ─── T2 — effective annual rate honours compounding frequency ─────────────
describe('T2 — effectiveAnnualRate', () => {
  it('12% compounded monthly ≈ 12.6825%', () => {
    expect(effectiveAnnualRate(0.12, 'monthly')).toBeCloseTo(0.126825, 6);
  });
  it('annual compounding is a no-op', () => {
    expect(effectiveAnnualRate(0.07, 'annually')).toBeCloseTo(0.07, 12);
  });
});

// ─── T3 — ordinary annuity (contributions at end) ─────────────────────────
describe('T3 — ordinary annuity FV', () => {
  it('$100/yr for 10 yrs at 5% end-of-period = 100·((1.05^10−1)/0.05)', () => {
    const r = computeInvestment({
      ...base,
      contribution: 100,
      contributionFrequency: 'annually',
      annualReturn: 0.05,
      contributionTiming: 'end',
    });
    expect(r.endBalance).toBeCloseTo((100 * (Math.pow(1.05, 10) - 1)) / 0.05, 6);
  });
});

// ─── T4 — annuity due (contributions at beginning) is (1+i)× larger ───────
describe('T4 — annuity due FV', () => {
  it('beginning-of-period is exactly (1+i)× the ordinary annuity', () => {
    const end = computeInvestment({
      ...base,
      contribution: 100,
      annualReturn: 0.05,
      contributionTiming: 'end',
    }).endBalance;
    const begin = computeInvestment({
      ...base,
      contribution: 100,
      annualReturn: 0.05,
      contributionTiming: 'beginning',
    }).endBalance;
    expect(begin).toBeCloseTo(end * 1.05, 6);
  });
});

// ─── T5 — zero return: end balance is just principal + contributions ──────
describe('T5 — zero return', () => {
  it('sums contributions with no interest', () => {
    const r = computeInvestment({
      ...base,
      startingAmount: 1000,
      contribution: 100,
      contributionFrequency: 'monthly',
      annualReturn: 0,
      years: 5,
    });
    expect(r.totalContributions).toBe(100 * 12 * 5);
    expect(r.totalInterest).toBeCloseTo(0, 9);
    expect(r.endBalance).toBeCloseTo(1000 + 100 * 12 * 5, 6);
  });
});

// ─── T6 — solveContribution round-trips against computeInvestment ─────────
describe('T6 — solveContribution round-trip', () => {
  it('recovers the contribution that produces a known end balance', () => {
    const input: InvestmentInput = {
      startingAmount: 10_000,
      contribution: 500,
      contributionFrequency: 'monthly',
      contributionTiming: 'end',
      annualReturn: 0.07,
      years: 20,
      compounding: 'monthly',
    };
    const target = computeInvestment(input).endBalance;
    const solved = solveContribution(target, input);
    expect(solved).toBeCloseTo(500, 4);
  });
});

// ─── T7 — solveStartingAmount round-trips ─────────────────────────────────
describe('T7 — solveStartingAmount round-trip', () => {
  it('recovers the starting amount for a known end balance', () => {
    const input: InvestmentInput = {
      startingAmount: 25_000,
      contribution: 300,
      contributionFrequency: 'quarterly',
      contributionTiming: 'end',
      annualReturn: 0.06,
      years: 15,
      compounding: 'quarterly',
    };
    const target = computeInvestment(input).endBalance;
    const solved = solveStartingAmount(target, input);
    expect(solved).toBeCloseTo(25_000, 3);
  });
});

// ─── T8 — solveReturn round-trips ─────────────────────────────────────────
describe('T8 — solveReturn round-trip', () => {
  it('recovers the annual return for a known end balance', () => {
    const input: InvestmentInput = {
      startingAmount: 15_000,
      contribution: 1000,
      contributionFrequency: 'monthly',
      contributionTiming: 'end',
      annualReturn: 0.08,
      years: 25,
      compounding: 'annually',
    };
    const target = computeInvestment(input).endBalance;
    const solved = solveReturn(target, input);
    expect(solved).not.toBeNull();
    expect(solved as number).toBeCloseTo(0.08, 4);
  });

  it('returns null when the target is unreachable', () => {
    // Zero principal, zero contribution → no return can produce a positive FV.
    expect(solveReturn(1000, base)).toBeNull();
  });
});

// ─── T9 — solveTime: lump sum doubling ────────────────────────────────────
describe('T9 — solveTime', () => {
  it('$10k → $20k at 7% annually ≈ ln(2)/ln(1.07) years', () => {
    const input: InvestmentInput = {
      ...base,
      startingAmount: 10_000,
      contribution: 0,
      annualReturn: 0.07,
      compounding: 'annually',
      contributionFrequency: 'annually',
    };
    const t = solveTime(20_000, input);
    expect(t).not.toBeNull();
    // Annual compounding only crosses the goal at year boundaries, so the
    // discrete model interpolates within year 11 and lands ~0.006yr off the
    // continuous ln(2)/ln(1.07) closed form. 1dp is the right precision here.
    expect(t as number).toBeCloseTo(Math.log(2) / Math.log(1.07), 1);
  });

  it('returns 0 when the goal is already met', () => {
    expect(solveTime(5000, { ...base, startingAmount: 10_000 })).toBe(0);
  });
});
