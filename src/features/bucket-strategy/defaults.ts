import type { BucketParams } from './types';

// Defaults per the spec. Research-backed starting points:
//  - 5 years of expenses in the stability bucket is a common "sleep at night"
//    buffer that covers a typical bear-market recovery without selling equities.
//  - The 35% cap keeps a very large buffer from starving long-run growth.
//  - Guardrail cut/restore rates (5.2% / 3.5%) bracket a ~4.5% start rate,
//    Guyton-Klinger style.
export const DEFAULT_BUCKET_PARAMS: BucketParams = {
  totalPortfolio: 1_500_000,
  monthlyExpenses: 5_000,
  stabilityYears: 5,
  stabilityCapPct: 35,
  inflationPct: 2.8,
  equityReturnPct: 9.5,
  equityVolPct: 16,
  fixedIncomeReturnPct: 4.5,
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
