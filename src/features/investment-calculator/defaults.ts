import type { CurrencyCode } from '@/lib/currency';
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

/** ₹5 lakh lump sum, ₹25,000/month SIP, at Indian nominal return norms. */
export const DEFAULT_INVESTMENT_INPUT_INR: InvestmentInput = {
  ...DEFAULT_INVESTMENT_INPUT,
  startingAmount: 500_000,
  contribution: 25_000,
  annualReturn: 0.12,
};

/** Default goal used by the "solve for" modes that need a target balance. */
export const DEFAULT_TARGET_END_AMOUNT = 500_000;
/** ₹1 crore — the canonical Indian savings milestone. */
export const DEFAULT_TARGET_END_AMOUNT_INR = 10_000_000;

export function getInvestmentDefaults(currency: CurrencyCode): InvestmentInput {
  return currency === 'INR' ? DEFAULT_INVESTMENT_INPUT_INR : DEFAULT_INVESTMENT_INPUT;
}

export function getTargetEndAmount(currency: CurrencyCode): number {
  return currency === 'INR' ? DEFAULT_TARGET_END_AMOUNT_INR : DEFAULT_TARGET_END_AMOUNT;
}
