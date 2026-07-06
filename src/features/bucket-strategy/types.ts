// Types for the Bucket Strategy Planner. Framework-agnostic (no React, no DOM)
// so the engine runs inside a Web Worker and is unit-testable in isolation.

/** Locale + currency code — the seam that lets an INR variant share this code. */
export interface CurrencyConfig {
  code: string; // e.g. 'USD'
  locale: string; // e.g. 'en-US'
}

export interface BucketParams {
  totalPortfolio: number; // 1_500_000
  monthlyExpenses: number; // 5_000
  stabilityYears: number; // 5   (slider 2–8)
  stabilityCapPct: number; // 35  (slider 20–50), whole percent
  inflationPct: number; // 2.8
  equityReturnPct: number; // 9.5 — arithmetic mean of simple annual returns
  equityVolPct: number; // 16  — stdev of simple annual returns
  fixedIncomeReturnPct: number; // 4.5
  crashSkipThresholdPct: number; // 15  — skip refill if equity drop ≥ this
  guardrailsEnabled: boolean; // true
  guardrailFreezeAfterNegative: boolean; // true — freeze the inflation raise after a negative equity year
  guardrailCutRatePct: number; // 5.2 — WR above this → cut spending 10%
  guardrailRestoreRatePct: number; // 3.5 — WR below this → restore one step
  socialSecurityMonthly: number; // 0
  socialSecurityStartYear: number; // 0   — offset in years from retirement
  partTimeMonthly: number; // 0
  partTimeYears: number; // 0
  horizonYears: number; // 40
  numRuns: number; // 5000
  seed?: number; // omitted → fresh seed each run
}

/** Per-year percentile band of total portfolio value across all runs. */
export interface PercentileBand {
  year: number; // 0..horizonYears
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

/**
 * One recorded year of a single path. Shared by the deterministic historical
 * path and by `simulateOnePath` (used in tests).
 */
export interface HistoricalYear {
  year: number; // calendar year for the historical path; retirement-year index otherwise
  yearIndex: number; // 0-based
  equityReturn: number; // simple, e.g. -0.091
  inflation: number; // that year's CPI change (fraction)
  stability: number;
  growth: number;
  portfolioNominal: number;
  portfolioReal: number; // deflated by cumulative inflation
  spending: number; // actual nominal spend that year
  withdrawalRate: number;
  refilled: boolean;
  skipped: boolean; // crash-skip fired
  cut: boolean; // guardrail cut fired
}

export interface SimulationResult {
  successRate: number; // 0..1 — portfolio > 0 at horizon
  effectiveStabilityTarget: number; // initial min(years×annual, cap%×portfolio)
  initialStability: number;
  initialGrowth: number;
  initialWithdrawalRate: number; // year-0 net withdrawal ÷ portfolio
  bandsReal: PercentileBand[]; // default view
  bandsNominal: PercentileBand[]; // nominal toggle
  medianYearsOfCuts: number;
  medianFinalRealSpending: number;
  baselineFinalRealSpending: number; // fully-indexed baseline (≈ today's annual spend)
  historicalPath: HistoricalYear[]; // deterministic 2000–2025 path
  meta: { runs: number; horizonYears: number; seed?: number };
}

// ─── Web Worker protocol ───────────────────────────────────────────────────
// One job computes BOTH the primary run and the guardrails-off run so the
// comparison overlay shares a single progress bar.

export interface WorkerInbound {
  type: 'run';
  params: BucketParams;
}

export interface ProgressMessage {
  type: 'progress';
  completed: number;
  total: number;
}

export interface DoneMessage {
  type: 'done';
  primary: SimulationResult;
  guardrailsOff: SimulationResult;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type WorkerOutbound = ProgressMessage | DoneMessage | ErrorMessage;
