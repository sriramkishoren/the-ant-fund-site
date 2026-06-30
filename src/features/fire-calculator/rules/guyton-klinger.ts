// Guyton-Klinger (2006) — withdrawal-rate guardrails. Start higher than 4%
// and govern spending with two rules:
//   - Capital Preservation Rule (CEILING): if current rate > initial × 1.20,
//     cut spending 10%.
//   - Prosperity Rule (FLOOR): if current rate < initial × 0.80, raise 10%.
//
// Capital Preservation is conventionally suspended in the final ~15 years of
// the horizon — let the portfolio coast.
//
// The rule's well-documented failure mode is whipsaw: in severe sequences the
// ceiling fires repeatedly, stacking 10% cuts. See the FIRE blog post for the
// 2024 Kitces / Income Lab cut-magnitude comparison.

import type { WithdrawalRuleImpl } from '../withdrawal-rules';

const UPPER = 1.2;
const LOWER = 0.8;
const ADJUST = 0.1;
const CAPITAL_PRESERVATION_SUSPEND_LAST_YEARS = 15;

export const guytonKlingerRule: WithdrawalRuleImpl = {
  kind: 'guyton-klinger',
  displayName: 'Guyton-Klinger guardrails',
  shortDescription:
    'Start higher than 4%; cut 10% if the rate climbs >20% above the start, raise 10% if it falls >20% below. Prone to whipsaw in bad sequences.',
  compute: (ctx) => {
    if (ctx.yearIndex === 0) {
      ctx.params._mult = 1;
      return ctx.baseRealSpending * ctx.inflationToDate;
    }

    const mult = ctx.params._mult ?? 1;
    const tentativeWithdrawal = ctx.baseRealSpending * ctx.inflationToDate * mult;
    const impliedRate =
      ctx.portfolioValue > 0 ? tentativeWithdrawal / ctx.portfolioValue : Infinity;

    const capitalPreservationActive =
      ctx.remainingHorizonYears > CAPITAL_PRESERVATION_SUSPEND_LAST_YEARS;

    let nextMult = mult;
    if (capitalPreservationActive && impliedRate > ctx.initialRate * UPPER) {
      nextMult = mult * (1 - ADJUST);
    } else if (impliedRate < ctx.initialRate * LOWER) {
      nextMult = mult * (1 + ADJUST);
    }
    ctx.params._mult = nextMult;

    return ctx.baseRealSpending * ctx.inflationToDate * nextMult;
  },
};
