// Variable Percentage Withdrawal (Bogleheads) — withdraw an age-rising % of
// the CURRENT portfolio each year. Self-adjusting, can't deplete.
//
// Lookup table is an approximation of the standard VPW table for a 60/40
// portfolio; cf. https://www.bogleheads.org/wiki/Variable_percentage_withdrawal
// Real tables vary slightly by allocation. Values here are a smooth fit
// suitable for a goal-setting calculator.

import type { WithdrawalRuleImpl } from '../withdrawal-rules';

function vpwPctForAge(age: number): number {
  // Below 40: not meaningful as a withdrawal rate.
  // 40 → 0.040; rises smoothly to 0.10 at age 100.
  if (age < 40) return 0.04;
  if (age >= 100) return 0.1;
  return 0.04 + ((age - 40) / 60) * (0.1 - 0.04);
}

export const vpwRule: WithdrawalRuleImpl = {
  kind: 'vpw',
  displayName: 'VPW (variable percentage)',
  shortDescription:
    'Withdraw an age-rising percentage of the current balance from a lookup table. Self-adjusting; can’t run dry; income varies.',
  compute: (ctx) => {
    const pct = vpwPctForAge(ctx.age);
    // Withdraw a fixed % of current portfolio; income tracks the portfolio.
    return Math.max(0, ctx.portfolioValue * pct);
  },
};
