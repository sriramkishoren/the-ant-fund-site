import type { InvestmentInput } from './types';

// Sensible starting point: a modest lump sum, a steady monthly contribution,
// a conservative long-run return, over a couple of decades.
export const DEFAULT_INVESTMENT_INPUT: InvestmentInput = {
  startingAmount: 20_000,
  contribution: 500,
  contributionFrequency: 'monthly',
  contributionTiming: 'end',
  annualReturn: 0.06,
  years: 20,
  compounding: 'annually',
};

/** Default goal used by the "solve for" modes that need a target balance. */
export const DEFAULT_TARGET_END_AMOUNT = 500_000;
