// RMD method — withdraw portfolio ÷ remaining life expectancy each year.
// IRS Required-Minimum-Distribution logic, used here as a withdrawal rule
// (Morningstar's 2026 work endorses it as a simple, self-adjusting choice).

import type { WithdrawalRuleImpl } from '../withdrawal-rules';

/** Simplified life-expectancy table (US Social Security 2024 unisex
 *  approximation). Returns expected remaining years at a given age. */
function remainingLifeExpectancy(age: number): number {
  if (age < 50) return Math.max(35, 95 - age);
  if (age < 60) return 95 - age;
  if (age < 70) return 92 - age * 0.95;
  if (age < 80) return 85 - age * 0.85;
  if (age < 90) return 60 - age * 0.55;
  return Math.max(3, 100 - age * 1.0);
}

export const rmdRule: WithdrawalRuleImpl = {
  kind: 'rmd',
  displayName: 'RMD method',
  shortDescription:
    'Divide the portfolio by remaining life expectancy each year. Simple, self-adjusting, can’t deplete.',
  compute: (ctx) => {
    const life = remainingLifeExpectancy(ctx.age);
    // Never withdraw more than the portfolio itself.
    return Math.max(0, Math.min(ctx.portfolioValue, ctx.portfolioValue / Math.max(1, life)));
  },
};
