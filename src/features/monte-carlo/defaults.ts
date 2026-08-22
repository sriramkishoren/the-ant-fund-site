import type { CurrencyCode } from '@/lib/currency';
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

/** ₹50 lakh invested, ₹50,000/month, ₹24 lakh a year in retirement. */
export const DEFAULT_INPUTS_INR: SimInputs = {
  ...DEFAULT_INPUTS,
  currentValue: 5_000_000,
  monthlyContribution: 50_000,
  inflationPct: 6,
  expectedReturnPct: 12,
  returnStdevPct: 18,
  annualWithdrawal: 2_400_000,
};

export function getMonteCarloDefaults(currency: CurrencyCode): SimInputs {
  return currency === 'INR' ? DEFAULT_INPUTS_INR : DEFAULT_INPUTS;
}
