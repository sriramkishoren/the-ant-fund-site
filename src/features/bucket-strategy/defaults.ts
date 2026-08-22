import type { CurrencyCode } from '@/lib/currency';
import type { BucketParams } from './types';

// Defaults per the spec. Research-backed starting points:
//  - 5 years of expenses in the stability bucket is a common "sleep at night"
//    buffer that covers a typical bear-market recovery without selling equities.
//  - The 35% cap keeps a very large buffer from starving long-run growth.
//  - Guardrail cut/restore rates (5.2% / 3.5%) bracket a ~4.5% start rate,
//    Guyton-Klinger style. These are percentages of the portfolio, so they are
//    the same in both currencies.
//
// The amounts and the market assumptions are NOT currency-independent: simply
// relabelling $1.5M as ₹15,00,000 would describe a ~$18k retirement. Each
// currency therefore carries a plan of realistic local size, with local
// inflation and return expectations.
export const DEFAULT_BUCKET_PARAMS: BucketParams = {
  totalPortfolio: 1_500_000,
  monthlyExpenses: 5_000,
  stabilityYears: 5,
  stabilityCapPct: 35,
  inflationPct: 3,
  equityReturnPct: 9.5,
  equityVolPct: 16,
  fixedIncomeReturnPct: 3.5,
  crashSkipThresholdPct: 15,
  guardrailsEnabled: true,
  guardrailFreezeAfterNegative: true,
  guardrailCutRatePct: 5.2,
  guardrailRestoreRatePct: 3.5,
  socialSecurityMonthly: 0,
  socialSecurityStartYear: 0,
  partTimeMonthly: 0,
  partTimeYears: 0,
  horizonYears: 40,
  numRuns: 5000,
};

/**
 * ₹4.5 crore corpus, ₹1.5 lakh/month, with Indian inflation and return norms.
 * The corpus is sized so the starting withdrawal rate is 4% — the same healthy
 * starting point as the dollar defaults. (₹3 crore against this spend would be
 * 6%, which trips the 5.2% guardrail in year one and would greet every rupee
 * user with a plan already cutting its own spending.)
 */
export const DEFAULT_BUCKET_PARAMS_INR: BucketParams = {
  ...DEFAULT_BUCKET_PARAMS,
  totalPortfolio: 45_000_000,
  monthlyExpenses: 150_000,
  inflationPct: 6,
  equityReturnPct: 12,
  equityVolPct: 18,
  fixedIncomeReturnPct: 6.5,
};

export function getBucketDefaults(currency: CurrencyCode): BucketParams {
  return currency === 'INR' ? DEFAULT_BUCKET_PARAMS_INR : DEFAULT_BUCKET_PARAMS;
}
