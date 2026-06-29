import type { SimInputs } from './types';

export const DEFAULT_INPUTS: SimInputs = {
  currentAge: 35,
  retirementAge: 60,
  currentValue: 100_000,
  monthlyContribution: 1_500,
  contributionIncreasePct: 3,
  inflationPct: 3,
  expectedReturnPct: 7,
  returnStdevPct: 15,
  annualWithdrawal: 60_000,
  withdrawalStrategy: 'fixed-real',
  withdrawalPct: 4,
  lifeExpectancy: 90,
  numSims: 10_000,
};
