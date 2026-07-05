// Pure investment-growth math. No React, no DOM. Every UI number comes from
// here so the logic stays testable in isolation.
//
// The model reconciles two independent frequencies — how often interest
// COMPOUNDS and how often you CONTRIBUTE — by routing everything through the
// effective annual rate (EAR):
//
//   1. Convert the nominal annual return + compounding frequency into an EAR.
//   2. Convert that EAR into the rate for one contribution period.
//
// That way contributions and growth are always applied on the same, mutually
// consistent clock, whatever the two frequencies are.

import type {
  CompoundingFrequency,
  ContributionFrequency,
  ContributionTiming,
  InvestmentInput,
  InvestmentResult,
  SolveFor,
  YearRow,
} from './types';

const COMPOUNDS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

const CONTRIBS_PER_YEAR: Record<ContributionFrequency, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
};

/** Effective annual rate from a nominal annual return + compounding frequency. */
export function effectiveAnnualRate(
  annualReturn: number,
  compounding: CompoundingFrequency,
): number {
  const m = COMPOUNDS_PER_YEAR[compounding];
  return Math.pow(1 + annualReturn / m, m) - 1;
}

/** Rate for a single contribution period, consistent with the EAR. */
function periodRate(ear: number, contribsPerYear: number): number {
  return Math.pow(1 + ear, 1 / contribsPerYear) - 1;
}

/** Total whole/partial contribution periods across the horizon. */
function totalPeriods(input: InvestmentInput): number {
  return Math.max(0, Math.round(CONTRIBS_PER_YEAR[input.contributionFrequency] * input.years));
}

/**
 * Future-value factor for a stream of unit contributions over N periods at
 * per-period rate i. Handles the i=0 case and the beginning/end timing switch.
 */
function annuityFactor(i: number, n: number, timing: ContributionTiming): number {
  if (n <= 0) return 0;
  const ordinary = i === 0 ? n : (Math.pow(1 + i, n) - 1) / i;
  return timing === 'beginning' ? ordinary * (1 + i) : ordinary;
}

/**
 * Forward projection: grow the starting amount and contribution stream to the
 * end of the horizon, returning the full year-by-year breakdown.
 */
export function computeInvestment(input: InvestmentInput): InvestmentResult {
  const n = CONTRIBS_PER_YEAR[input.contributionFrequency];
  const ear = effectiveAnnualRate(input.annualReturn, input.compounding);
  const i = periodRate(ear, n);
  const periods = totalPeriods(input);

  let balance = input.startingAmount;
  let totalContributions = 0;

  const years: YearRow[] = [];
  let yearStart = balance;
  let yearContrib = 0;
  let yearInterest = 0;

  for (let p = 1; p <= periods; p++) {
    if (input.contributionTiming === 'beginning') {
      balance += input.contribution;
      yearContrib += input.contribution;
      totalContributions += input.contribution;
    }

    const interest = balance * i;
    balance += interest;
    yearInterest += interest;

    if (input.contributionTiming === 'end') {
      balance += input.contribution;
      yearContrib += input.contribution;
      totalContributions += input.contribution;
    }

    // Close a year row on each year boundary and at the very end (which may be
    // a partial year when `years` is fractional).
    if (p % n === 0 || p === periods) {
      years.push({
        year: years.length + 1,
        startBalance: yearStart,
        contributions: yearContrib,
        interest: yearInterest,
        endBalance: balance,
      });
      yearStart = balance;
      yearContrib = 0;
      yearInterest = 0;
    }
  }

  return {
    endBalance: balance,
    totalContributions,
    startingAmount: input.startingAmount,
    totalInterest: balance - input.startingAmount - totalContributions,
    years,
  };
}

// ─── Solvers ─────────────────────────────────────────────────────────────
// Each solves for one variable given a target end balance and everything else.
// Closed-form where a closed form exists; a bounded search otherwise.

/** Required periodic contribution to hit `target`. */
export function solveContribution(target: number, input: InvestmentInput): number | null {
  const n = CONTRIBS_PER_YEAR[input.contributionFrequency];
  const ear = effectiveAnnualRate(input.annualReturn, input.compounding);
  const i = periodRate(ear, n);
  const periods = totalPeriods(input);
  const af = annuityFactor(i, periods, input.contributionTiming);
  if (af === 0) return null;
  const fvStart = input.startingAmount * Math.pow(1 + i, periods);
  return (target - fvStart) / af;
}

/** Required starting lump sum to hit `target`. */
export function solveStartingAmount(target: number, input: InvestmentInput): number | null {
  const n = CONTRIBS_PER_YEAR[input.contributionFrequency];
  const ear = effectiveAnnualRate(input.annualReturn, input.compounding);
  const i = periodRate(ear, n);
  const periods = totalPeriods(input);
  if (periods === 0) return target;
  const af = annuityFactor(i, periods, input.contributionTiming);
  const fvContribs = input.contribution * af;
  return (target - fvContribs) / Math.pow(1 + i, periods);
}

/**
 * Required nominal annual return to hit `target`. End balance is monotonically
 * increasing in the return (for non-negative principal and contributions), so a
 * bisection is safe and robust where no closed form exists.
 */
export function solveReturn(target: number, input: InvestmentInput): number | null {
  const f = (r: number) => computeInvestment({ ...input, annualReturn: r }).endBalance;

  let lo = -0.99;
  let hi = 1.0;
  let fHi = f(hi);
  let guard = 0;
  while (fHi < target && hi < 100 && guard++ < 100) {
    hi *= 1.5;
    fHi = f(hi);
  }

  const fLo = f(lo);
  if (target < fLo || target > f(hi)) return null;

  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm - target) < 1e-6 * Math.max(1, Math.abs(target))) return mid;
    if (fm < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Years needed to reach `target`, interpolated within the crossing period.
 * Returns 0 if the starting amount already meets the goal, or null if the goal
 * is never reached within 200 years.
 */
export function solveTime(target: number, input: InvestmentInput): number | null {
  if (target <= input.startingAmount) return 0;

  const n = CONTRIBS_PER_YEAR[input.contributionFrequency];
  const ear = effectiveAnnualRate(input.annualReturn, input.compounding);
  const i = periodRate(ear, n);

  let balance = input.startingAmount;
  const maxPeriods = n * 200;
  for (let p = 1; p <= maxPeriods; p++) {
    const prev = balance;
    if (input.contributionTiming === 'beginning') balance += input.contribution;
    balance += balance * i;
    if (input.contributionTiming === 'end') balance += input.contribution;

    if (balance >= target) {
      const frac = balance === prev ? 1 : (target - prev) / (balance - prev);
      return (p - 1 + frac) / n;
    }
  }
  return null;
}

export interface SolveOutcome {
  /** The solved value in canonical units (fraction for return, years for time). */
  value: number | null;
  /** The input with the solved field substituted in, for charts/tables. */
  resolvedInput: InvestmentInput;
  /** Forward projection of the resolved input (null when unsolvable). */
  result: InvestmentResult | null;
}

/**
 * Single entry point the UI uses: given the mode, the inputs, and a target end
 * balance, return the solved value plus a fully-resolved projection to render.
 */
export function resolvePlan(
  solveFor: SolveFor,
  input: InvestmentInput,
  targetEndAmount: number,
): SolveOutcome {
  if (solveFor === 'endAmount') {
    const result = computeInvestment(input);
    return { value: result.endBalance, resolvedInput: input, result };
  }

  let value: number | null;
  let resolvedInput: InvestmentInput;

  switch (solveFor) {
    case 'contribution':
      value = solveContribution(targetEndAmount, input);
      resolvedInput = { ...input, contribution: value ?? input.contribution };
      break;
    case 'return':
      value = solveReturn(targetEndAmount, input);
      resolvedInput = { ...input, annualReturn: value ?? input.annualReturn };
      break;
    case 'startingAmount':
      value = solveStartingAmount(targetEndAmount, input);
      resolvedInput = { ...input, startingAmount: value ?? input.startingAmount };
      break;
    case 'time':
      value = solveTime(targetEndAmount, input);
      resolvedInput = { ...input, years: value ?? input.years };
      break;
    default:
      return { value: null, resolvedInput: input, result: null };
  }

  const result = value === null ? null : computeInvestment(resolvedInput);
  return { value, resolvedInput, result };
}
