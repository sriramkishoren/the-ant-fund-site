// FIRE calculator engine — public types. Pure data; no React, no DOM.
// Read docs/fire-calculator/SPEC.md before changing shapes.

export interface Allocation {
  /** All three should sum to 1.0. */
  stocks: number;
  bonds: number;
  cash: number;
}

export type CashFlowKind =
  | 'social-security'
  | 'pension'
  | 'rental'
  | 'barista'
  | 'lump-sum'
  | 'other';

export type ColaMode = 'cpi' | 'fixed' | 'fraction';

export interface CashFlow {
  kind: CashFlowKind;
  label: string;
  /** Year offset from year 0 (today). 0 = this year. */
  startYearOffset: number;
  /** Inclusive end year. Omit for lifetime. */
  endYearOffset?: number;
  /** Real dollars per year as of year 0. */
  annualAmount: number;
  colaMode: ColaMode;
  /** Used when colaMode === 'fraction' (e.g. 0.5 for half-CPI). */
  colaFraction?: number;
  /** Reserved for v2 tax engine. */
  taxable?: boolean;
}

export type WithdrawalRuleKind =
  | 'fixed-real'
  | 'risk-based-guardrails'
  | 'guyton-klinger'
  | 'vpw'
  | 'rmd';

export interface WithdrawalRule {
  kind: WithdrawalRuleKind;
  /** Initial withdrawal rate as a fraction (e.g. 0.04 for 4%). */
  initialRate: number;
  /** Rule-specific knobs. Each rule documents its own keys. */
  params?: Record<string, number>;
}

export type TaxPolicy = 'none' | 'simple-blended';

export interface StressFlags {
  /** Forces the first 5 years of every sim to draw from historically-bad blocks. */
  forceBadFirstYears?: boolean;
  /** Injects a lumpy LTC expense in the last 10% of the horizon. */
  longTermCareShock?: boolean;
}

export interface PlanInput {
  /** Current invested assets in today's dollars. */
  portfolio: number;
  /** Desired real annual spending in retirement. */
  annualSpending: number;
  currentAge: number;
  retirementAge: number;
  /** Simulation length in years (defaults to lifeExpectancy - retirementAge upstream). */
  horizonYears: number;
  allocation: Allocation;
  withdrawalRule: WithdrawalRule;
  cashFlows: CashFlow[];
  /** 0..1; default 0.9 (90%). */
  successThreshold: number;
  /** User override; otherwise computed from bundled Shiller data. */
  capeOverride?: number;
  /** Default 10_000. */
  numSims: number;
  /** PRNG seed for reproducible runs. */
  seed?: number;
  stress?: StressFlags;
  /** Reserved for v2. Always 'none' in v1. */
  taxPolicy?: TaxPolicy;
}

export interface YearlyPercentile {
  age: number;
  yearOffset: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface YearlyDetailRow {
  age: number;
  yearOffset: number;
  startValue: number;
  /** Positive = inflows (contributions, SS, pension, rental). Negative = withdrawals. */
  cashflow: number;
  growth: number;
  endValue: number;
  phase: 'accumulation' | 'decumulation';
}

export interface PlanResult {
  /** Deterministic headline: annualSpending / usedSwr. */
  fireNumber: number;
  /** SWR actually used (rule.initialRate, or upstream-resolved default). */
  usedSwr: number;
  /** 1 / usedSwr. */
  multiple: number;
  /** Probability of finishing the horizon with portfolio > 0. */
  successProbability: number;
  percentiles: YearlyPercentile[];
  /** Up to ~100 sample paths for the chart overlay. */
  samplePaths: number[][];
  detailPaths: {
    median: YearlyDetailRow[];
    p10: YearlyDetailRow[];
    p90: YearlyDetailRow[];
  };
  meta: {
    runs: number;
    seed: number;
    capeUsed: number;
    capeAsOf: string;
    withdrawalRule: WithdrawalRuleKind;
    horizonYears: number;
    blockSize: number;
  };
}

// ─── Worker protocol ──────────────────────────────────────────────────────
export interface WorkerInbound {
  type: 'run';
  input: PlanInput;
  /** The dataset is fetched on the main thread and shipped in. */
  dataset: import('./data-types').ShillerDataset;
}

export interface SimProgress {
  type: 'progress';
  completed: number;
  total: number;
}
export interface SimDone {
  type: 'done';
  result: PlanResult;
}
export interface SimError {
  type: 'error';
  message: string;
}
export type WorkerOutbound = SimProgress | SimDone | SimError;
