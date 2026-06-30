import type { PlanInput } from './types';

export const DEFAULT_PLAN_INPUT: PlanInput = {
  portfolio: 100_000,
  annualSpending: 50_000,
  currentAge: 35,
  retirementAge: 50,
  // lifeExpectancy 95 - retirementAge 50 = 45-year horizon
  horizonYears: 45,
  allocation: { stocks: 0.8, bonds: 0.2, cash: 0 },
  withdrawalRule: {
    kind: 'fixed-real',
    initialRate: 0.04,
  },
  cashFlows: [],
  successThreshold: 0.9,
  numSims: 10_000,
  taxPolicy: 'none',
};

/** Block-bootstrap block size in months. 60 months = 5 years. */
export const DEFAULT_BLOCK_SIZE_MONTHS = 60;
