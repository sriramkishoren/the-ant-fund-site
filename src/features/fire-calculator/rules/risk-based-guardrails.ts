// Risk-based guardrails — v1 cheap proxy.
//
// The "real" risk-based guardrails (Kitces / Income Lab) recompute a Monte
// Carlo success probability each year and trigger when it drifts. Nesting an
// MC inside an MC is O(n²) and prohibitively slow.
//
// v1 cheap proxy (documented in docs/fire-calculator/CLAUDE.md §4.6):
// compute the implied withdrawal rate (this year's withdrawal divided by the
// current portfolio), and trigger on its drift from the initial rate using
// *wider* rails and *smaller* adjustments than Guyton-Klinger — capturing the
// "smaller, more frequent" intuition of probability-based rails without
// nesting a simulation.
//
//   - implied > initialRate × 1.50  → cut spending 5%
//   - implied < initialRate × 0.70  → raise spending 5%
//   - else hold
//
// Adjustments are sticky (the new real-spending floor persists until the next
// trigger), modeled via the multiplier kept on ctx.params._mult.

import type { WithdrawalRuleImpl } from '../withdrawal-rules';

const UPPER_TRIGGER = 1.5;
const LOWER_TRIGGER = 0.7;
const ADJUST = 0.05;

export const riskBasedGuardrailsRule: WithdrawalRuleImpl = {
  kind: 'risk-based-guardrails',
  displayName: 'Risk-based guardrails',
  shortDescription:
    'Smaller, more frequent spending adjustments triggered when the implied withdrawal rate drifts. Modern improvement over Guyton-Klinger.',
  compute: (ctx) => {
    // Year-1: no history — just take the initial real spending.
    if (ctx.yearIndex === 0) {
      ctx.params._mult = 1;
      return ctx.baseRealSpending * ctx.inflationToDate;
    }

    // Multiplier persists across years; default to 1 if engine recreated ctx.
    const mult = ctx.params._mult ?? 1;
    const tentativeWithdrawal = ctx.baseRealSpending * ctx.inflationToDate * mult;
    const impliedRate =
      ctx.portfolioValue > 0 ? tentativeWithdrawal / ctx.portfolioValue : Infinity;

    let nextMult = mult;
    if (impliedRate > ctx.initialRate * UPPER_TRIGGER) {
      nextMult = mult * (1 - ADJUST);
    } else if (impliedRate < ctx.initialRate * LOWER_TRIGGER) {
      nextMult = mult * (1 + ADJUST);
    }
    ctx.params._mult = nextMult;

    return ctx.baseRealSpending * ctx.inflationToDate * nextMult;
  },
};
