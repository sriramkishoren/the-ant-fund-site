// Inputs and outputs for the Monte Carlo retirement simulator.
// Kept framework-agnostic so the engine can run inside a Web Worker.

export type WithdrawalStrategy = 'fixed-real' | 'fixed-nominal' | 'percent-of-portfolio';

export interface SimInputs {
  currentAge: number;
  retirementAge: number;
  currentValue: number;
  monthlyContribution: number;
  contributionIncreasePct: number; // e.g. 3 means 3% per year
  inflationPct: number;
  expectedReturnPct: number;
  returnStdevPct: number;
  annualWithdrawal: number; // in today's dollars
  withdrawalStrategy: WithdrawalStrategy;
  withdrawalPct: number; // used only when strategy === 'percent-of-portfolio' (e.g. 4)
  lifeExpectancy: number;
  numSims: number;
  seed?: number;
}

export interface YearlyPercentile {
  age: number;
  yearOffset: number; // years from now
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  successCount: number;
  failureCount: number;
}

export interface YearlyDetailRow {
  age: number;
  yearOffset: number;
  startValue: number;
  cashflow: number; // positive = contribution; negative = withdrawal
  growth: number;
  endValue: number;
  phase: 'accumulation' | 'decumulation';
}

export interface SimResult {
  // ~100 individual paths sampled for the overlay (each is the full year-by-year value series)
  samplePaths: number[][];
  // Aggregated percentile bands per year (length = years + 1)
  yearlyPercentiles: YearlyPercentile[];
  // Terminal-value histogram with success/failure split per bucket
  terminalHistogram: HistogramBin[];
  // Summary
  successRate: number;
  failureRate: number;
  medianTerminal: number;
  p10Terminal: number;
  p90Terminal: number;
  medianDepletionAge: number | null;
  // Per-percentile year-by-year detail tables
  detailPaths: {
    median: YearlyDetailRow[];
    p10: YearlyDetailRow[];
    p90: YearlyDetailRow[];
  };
  meta: {
    runs: number;
    startAge: number;
    endAge: number;
    seed?: number;
  };
}

export interface SimProgress {
  type: 'progress';
  completed: number;
  total: number;
}

export interface SimDone {
  type: 'done';
  result: SimResult;
}

export interface SimError {
  type: 'error';
  message: string;
}

export type WorkerOutbound = SimProgress | SimDone | SimError;

export interface WorkerInbound {
  type: 'run';
  inputs: SimInputs;
}
