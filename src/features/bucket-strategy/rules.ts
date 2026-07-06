// Pure maintenance-rule helpers. No state, no randomness — every branch here is
// directly unit-tested. The simulation loop in engine.ts calls these so the
// rule logic lives in one auditable place.

import type { BucketParams } from './types';

/** Fixed 10% spending reduction when a guardrail cut fires (Guyton-Klinger style). */
const CUT_FACTOR = 0.9;

/**
 * The stability bucket's target size:
 *   min(years of expenses, cap% of the current portfolio).
 * The cap stops a very large buffer from starving long-run growth.
 */
export function effectiveStabilityTarget(args: {
  stabilityYears: number;
  annualExpenses: number;
  capPct: number;
  portfolio: number;
}): number {
  const yearsRule = args.stabilityYears * args.annualExpenses;
  const capRule = (args.capPct / 100) * args.portfolio;
  return Math.max(0, Math.min(yearsRule, capRule));
}

/**
 * Crash-skip: skip the annual refill when equities fell by at least the
 * threshold. Fires AT the threshold (a 15% drop with a 15% threshold skips).
 */
export function isCrashSkip(equityReturn: number, thresholdPct: number): boolean {
  return -equityReturn * 100 >= thresholdPct;
}

/**
 * Determine next year's actual spending from this year's outcome.
 *
 * Order (per spec §3):
 *   1. Inflation raise — unless guardrails froze it after a negative equity year.
 *   2. Guardrail cut (−10%) if the withdrawal rate breached the upper rail, or a
 *      restore step (+one 10% step, capped at the fully-indexed baseline) if it
 *      fell below the lower rail.
 *   3. Never let spending exceed the fully-indexed baseline.
 */
export function nextSpending(args: {
  currentSpending: number;
  indexedBaselineNext: number;
  inflation: number;
  equityReturn: number;
  withdrawalRate: number;
  params: BucketParams;
}): { spending: number; cut: boolean } {
  const { currentSpending, indexedBaselineNext, inflation, equityReturn, withdrawalRate, params } =
    args;

  const guardrails = params.guardrailsEnabled;
  const freeze = guardrails && params.guardrailFreezeAfterNegative && equityReturn < 0;

  // Step 1 — inflation raise (or freeze it).
  let s = freeze ? currentSpending : currentSpending * (1 + inflation);

  // Step 2 — cut / restore rails.
  let cut = false;
  if (guardrails && withdrawalRate > params.guardrailCutRatePct / 100) {
    s = s * CUT_FACTOR;
    cut = true;
  } else if (guardrails && withdrawalRate < params.guardrailRestoreRatePct / 100) {
    s = Math.min(s / CUT_FACTOR, indexedBaselineNext);
  }

  // Step 3 — never exceed the fully-indexed baseline.
  s = Math.min(s, indexedBaselineNext);

  return { spending: s, cut };
}
