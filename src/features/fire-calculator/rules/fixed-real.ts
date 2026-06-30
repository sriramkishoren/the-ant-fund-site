// Bengen / Trinity: withdraw initialRate × startingPortfolio in year 1, then
// raise the dollar amount by CPI inflation every year. The conservative
// default; ignores portfolio value after year 1.

import type { WithdrawalRuleImpl } from '../withdrawal-rules';

export const fixedRealRule: WithdrawalRuleImpl = {
  kind: 'fixed-real',
  displayName: 'Fixed (inflation-adjusted)',
  shortDescription:
    'Withdraw the same real dollar amount every year, raised by inflation. The classic 4% rule.',
  compute: (ctx) => {
    // baseRealSpending is the year-1 withdrawal in today's dollars; multiply
    // by the cumulative inflation factor to convert to nominal.
    return ctx.baseRealSpending * ctx.inflationToDate;
  },
};
