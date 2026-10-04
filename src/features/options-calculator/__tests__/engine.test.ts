import { describe, it, expect } from 'vitest';
import { breakevenPrice, calculateOption, intrinsicValue, plPerShareAt } from '../engine';
import { getOptionDefaults } from '../defaults';
import type { OptionInput, OptionStrategy } from '../types';

const base = (over: Partial<OptionInput> = {}): OptionInput => ({
  strategy: 'long-call',
  currentPrice: 100,
  strike: 105,
  premium: 2,
  contracts: 1,
  sharesPerContract: 100,
  daysToExpiry: 45,
  costBasis: 100,
  ...over,
});

const ALL: OptionStrategy[] = ['long-call', 'long-put', 'cash-secured-put', 'covered-call'];

// ─── Reproduce the reference spreadsheet ──────────────────────────────────
describe('matches the reference sheet — buying calls', () => {
  const r = calculateOption(base({ strategy: 'long-call', strike: 780, premium: 13, currentPrice: 800 }));

  it('breaks even at strike + premium', () => {
    expect(r.breakeven).toBe(793);
  });
  it('profit per share is the intrinsic value less the premium', () => {
    expect(r.plTodayPerShare).toBeCloseTo(7, 10);
  });
  it('profit per contract scales by the lot', () => {
    expect(r.plTodayTotal).toBeCloseTo(700, 10);
  });
  it('return on premium', () => {
    expect(r.returnOnCapital).toBeCloseTo(0.5385, 4);
  });
});

describe('matches the reference sheet — cash-secured put', () => {
  const r = calculateOption(
    base({ strategy: 'cash-secured-put', strike: 335, premium: 5.4, currentPrice: 350 }),
  );

  it('breaks even at strike − premium', () => {
    expect(r.breakeven).toBeCloseTo(329.6, 10);
  });
  it('breakeven is 5.83% below today', () => {
    expect(r.moveToBreakevenPct).toBeCloseTo(-0.0583, 4);
  });
  it('strike is 4.29% below today', () => {
    expect(r.strikeVsCurrentPct).toBeCloseTo(-0.0429, 4);
  });
  it('keeps the full premium while the stock is above the strike', () => {
    expect(r.plTodayPerShare).toBeCloseTo(5.4, 10);
    expect(r.plTodayTotal).toBeCloseTo(540, 10);
  });
  it('secures strike × lot in cash', () => {
    expect(r.capital).toBeCloseTo(33_500, 10);
  });
  it('return on cash', () => {
    expect(r.returnOnCapital).toBeCloseTo(0.0161, 4);
  });
});

// ─── Invariants that must hold for every strategy ─────────────────────────
describe('invariants across all four strategies', () => {
  it('profit is exactly zero at the breakeven price', () => {
    for (const strategy of ALL) {
      const input = base({ strategy, strike: strategy === 'long-call' || strategy === 'covered-call' ? 105 : 95 });
      expect(plPerShareAt(input, breakevenPrice(input))).toBeCloseTo(0, 10);
    }
  });

  it('a buyer pays a debit and a seller receives a credit', () => {
    expect(calculateOption(base({ strategy: 'long-call' })).cashFlow).toBe('debit');
    expect(calculateOption(base({ strategy: 'long-put' })).cashFlow).toBe('debit');
    expect(calculateOption(base({ strategy: 'cash-secured-put' })).cashFlow).toBe('credit');
    expect(calculateOption(base({ strategy: 'covered-call' })).cashFlow).toBe('credit');
  });

  it('the payoff curve passes through zero at breakeven and is monotone in the right direction', () => {
    for (const strategy of ALL) {
      const input = base({ strategy });
      const lo = plPerShareAt(input, 50);
      const hi = plPerShareAt(input, 150);
      // Calls and stock-owning positions gain as the underlying rises; puts lose.
      if (strategy === 'long-put') expect(lo).toBeGreaterThan(hi);
      else expect(hi).toBeGreaterThanOrEqual(lo);
    }
  });

  it('scenarios are sorted, de-duplicated and labelled', () => {
    const r = calculateOption(base());
    const prices = r.scenarios.map((s) => s.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    expect(new Set(prices.map((p) => p.toFixed(2))).size).toBe(prices.length);
    expect(r.scenarios.some((s) => s.note === 'Breakeven')).toBe(true);
    expect(r.scenarios.some((s) => s.note === 'Current price')).toBe(true);
  });
});

// ─── Long call ────────────────────────────────────────────────────────────
describe('long call', () => {
  const r = calculateOption(base({ strategy: 'long-call' }));

  it('loses only the premium below the strike, and is unlimited above', () => {
    expect(r.maxLoss).toBe(-200);
    expect(r.maxProfit).toBeNull();
  });
  it('an out-of-the-money call has no intrinsic value — it is all time value', () => {
    expect(r.intrinsicPerShare).toBe(0);
    expect(r.extrinsicPerShare).toBe(2);
    expect(r.moneyness).toBe('OTM');
  });
  it('matches the chapter example: $115 at expiration returns $800', () => {
    expect(plPerShareAt(base(), 115) * 100).toBeCloseTo(800, 10);
  });
  it('does not annualise a "what is it worth today" return', () => {
    expect(r.annualizedReturn).toBeNull();
  });
});

// ─── Long put ─────────────────────────────────────────────────────────────
describe('long put', () => {
  const r = calculateOption(base({ strategy: 'long-put', strike: 95 }));

  it('caps profit at the strike less the premium, since the stock stops at zero', () => {
    expect(r.maxProfit).toBeCloseTo(9300, 10);
    expect(r.maxLoss).toBe(-200);
  });
  it('matches the chapter example: $80 at expiration returns $1,300', () => {
    expect(plPerShareAt(base({ strategy: 'long-put', strike: 95 }), 80) * 100).toBeCloseTo(1300, 10);
  });
  it('is in the money when the stock sits below the strike', () => {
    expect(calculateOption(base({ strategy: 'long-put', strike: 95, currentPrice: 90 })).moneyness).toBe('ITM');
  });
});

// ─── Cash-secured put ─────────────────────────────────────────────────────
describe('cash-secured put', () => {
  const r = calculateOption(base({ strategy: 'cash-secured-put', strike: 95 }));

  it('annualises the return on cash', () => {
    // 2/95 over 45 days ≈ 2.105% → ×(365/45)
    expect(r.returnOnCapital).toBeCloseTo(0.021053, 6);
    expect(r.annualizedReturn).toBeCloseTo(0.021053 * (365 / 45), 5);
  });
  it('reports the discount to today if assigned', () => {
    // breakeven 93 vs 100 today
    expect(r.discountIfAssignedPct).toBeCloseTo(-0.07, 10);
  });
  it('max loss assumes the underlying goes to zero', () => {
    expect(r.maxProfit).toBeCloseTo(200, 10);
    expect(r.maxLoss).toBeCloseTo(-9300, 10);
  });
});

// ─── Covered call ─────────────────────────────────────────────────────────
describe('covered call', () => {
  const r = calculateOption(base({ strategy: 'covered-call', strike: 105, costBasis: 100 }));

  it('profits by the premium plus the gain up to the strike if called away', () => {
    expect(r.ifCalledProfit).toBeCloseTo(700, 10); // (105 − 100 + 2) × 100
    expect(r.maxProfit).toBeCloseTo(700, 10);
  });
  it('the premium cushions the cost basis on the way down', () => {
    expect(r.breakeven).toBeCloseTo(98, 10);
    expect(r.downsideProtectionPct).toBeCloseTo(0.02, 10);
  });
  it('caps the upside at the strike', () => {
    expect(r.upsideCapPct).toBeCloseTo(0.05, 10);
    expect(plPerShareAt(base({ strategy: 'covered-call' }), 130)).toBeCloseTo(7, 10);
  });
  it('separates the static return from the if-called return', () => {
    expect(r.returnOnCapital).toBeCloseTo(0.02, 10); // premium ÷ today's price
    expect(r.ifCalledReturn).toBeCloseTo(0.07, 10); // (105 − 100 + 2) ÷ 100
  });
  it('a cost basis above the market still breaks even off the basis', () => {
    const under = calculateOption(base({ strategy: 'covered-call', costBasis: 120 }));
    expect(under.breakeven).toBeCloseTo(118, 10);
    expect(under.ifCalledProfit).toBeCloseTo(-1300, 10); // called away at a loss
  });
});

// ─── Helpers and defaults ─────────────────────────────────────────────────
describe('helpers', () => {
  it('intrinsic value is never negative', () => {
    expect(intrinsicValue('long-call', 90, 100)).toBe(0);
    expect(intrinsicValue('long-call', 110, 100)).toBe(10);
    expect(intrinsicValue('long-put', 90, 100)).toBe(10);
    expect(intrinsicValue('long-put', 110, 100)).toBe(0);
  });

  it('scales by contracts and lot size', () => {
    const r = calculateOption(base({ strategy: 'cash-secured-put', strike: 95, contracts: 3, sharesPerContract: 50 }));
    expect(r.shares).toBe(150);
    expect(r.premiumTotal).toBeCloseTo(300, 10);
    expect(r.capital).toBeCloseTo(95 * 150, 10);
  });

  it('gives every strategy a usable default in both currencies', () => {
    for (const strategy of ALL) {
      for (const cur of ['USD', 'INR'] as const) {
        const d = getOptionDefaults(strategy, cur);
        expect(d.strike).toBeGreaterThan(0);
        expect(d.premium).toBeGreaterThan(0);
        expect(Number.isFinite(calculateOption(d).breakeven)).toBe(true);
      }
    }
  });

  it('survives zero and empty inputs without producing NaN', () => {
    const r = calculateOption(base({ currentPrice: 0, strike: 0, premium: 0, contracts: 0 }));
    for (const v of [r.breakeven, r.moveToBreakevenPct, r.returnOnCapital, r.plTodayTotal, r.capital]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});
