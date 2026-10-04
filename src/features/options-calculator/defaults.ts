import type { CurrencyCode } from '@/lib/currency';
import type { OptionInput, OptionStrategy } from './types';

// The dollar defaults deliberately mirror the worked example in the Options
// trading course (XYZ at $100, a $105 call or $95 put at $2.00, 45 days), so a
// reader can type the chapter's numbers in and watch them reproduce.
const USD_BASE = {
  currentPrice: 100,
  premium: 2,
  contracts: 1,
  sharesPerContract: 100,
  daysToExpiry: 45,
} as const;

const INR_BASE = {
  currentPrice: 1400,
  premium: 28,
  contracts: 1,
  // Indian contracts use a per-stock lot size rather than a flat 100 — this is
  // only a starting point, set it to your contract's actual lot.
  sharesPerContract: 100,
  daysToExpiry: 45,
} as const;

function build(
  strategy: OptionStrategy,
  base: typeof USD_BASE | typeof INR_BASE,
  strike: number,
): OptionInput {
  return { strategy, ...base, strike, costBasis: base.currentPrice };
}

export function getOptionDefaults(
  strategy: OptionStrategy,
  currency: CurrencyCode,
): OptionInput {
  const base = currency === 'INR' ? INR_BASE : USD_BASE;
  // Calls default to a strike above the current price, puts to one below —
  // the out-of-the-money side people usually start from.
  const up = currency === 'INR' ? 1450 : 105;
  const down = currency === 'INR' ? 1350 : 95;

  switch (strategy) {
    case 'long-call':
    case 'covered-call':
      return build(strategy, base, up);
    case 'long-put':
    case 'cash-secured-put':
      return build(strategy, base, down);
  }
}

export const STRATEGY_LABELS: Record<OptionStrategy, string> = {
  'long-call': 'Buy a call',
  'long-put': 'Buy a put',
  'cash-secured-put': 'Sell a cash-secured put',
  'covered-call': 'Sell a covered call',
};

export const STRATEGY_BLURBS: Record<OptionStrategy, string> = {
  'long-call':
    'A bullish bet with a defined maximum loss — the premium you pay. You need enough upward movement, soon enough, to clear the premium.',
  'long-put':
    'A bearish bet with a defined maximum loss — the premium you pay. A small decline may still lose money at expiration.',
  'cash-secured-put':
    'You set aside cash to buy the shares at the strike and collect premium for the obligation. Best case: it expires worthless and you keep the premium.',
  'covered-call':
    'You own the shares and sell someone the right to buy them at the strike. The premium cushions a fall, but caps your upside above the strike.',
};
