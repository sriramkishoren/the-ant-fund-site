// Type definitions for the Investment Calculator. Pure data — no React, no DOM
// — so the engine stays unit-testable and could run in a worker if it ever
// needs to.

export type ContributionFrequency = 'monthly' | 'quarterly' | 'annually';

export type CompoundingFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'daily';

/** Whether periodic contributions land at the start or end of each period. */
export type ContributionTiming = 'beginning' | 'end';

/**
 * Which variable the calculator solves for. Everything else is an input; the
 * selected field becomes the output. `endAmount` is the plain forward
 * projection.
 */
export type SolveFor =
  | 'endAmount'
  | 'contribution'
  | 'return'
  | 'startingAmount'
  | 'time';

export interface InvestmentInput {
  /** Initial lump sum invested at t=0. */
  startingAmount: number;
  /** Amount added each contribution period. */
  contribution: number;
  contributionFrequency: ContributionFrequency;
  contributionTiming: ContributionTiming;
  /** Nominal annual return as a decimal fraction, e.g. 0.07 = 7%. */
  annualReturn: number;
  /** Investment length in years (may be fractional when solved for). */
  years: number;
  compounding: CompoundingFrequency;
}

/** One accumulation year, for the year-by-year table. */
export interface YearRow {
  year: number; // 1-based
  startBalance: number;
  contributions: number; // contributions added during this year
  interest: number; // interest earned during this year
  endBalance: number;
}

export interface InvestmentResult {
  endBalance: number;
  /** Sum of periodic contributions (excludes the starting amount). */
  totalContributions: number;
  startingAmount: number;
  totalInterest: number;
  years: YearRow[];
}
