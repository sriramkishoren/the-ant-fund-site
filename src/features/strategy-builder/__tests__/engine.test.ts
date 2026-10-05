import { describe, it, expect } from 'vitest';
import {
  allSameExpiry,
  analysePosition,
  horizonDays,
  netCashflow,
  netGreeks,
  plAt,
  positionValue,
} from '../engine';
import type { Leg, MarketInputs, Position } from '../types';

const market: MarketInputs = {
  spot: 100,
  rate: 0.04,
  dividendYield: 0,
  sharesPerContract: 100,
  ivMultiplier: 1,
};

let n = 0;
const leg = (over: Partial<Leg>): Leg => ({
  id: `l${n++}`,
  kind: 'call',
  action: 'buy',
  quantity: 1,
  strike: 100,
  daysToExpiry: 30,
  premium: 2,
  iv: 0.3,
  ...over,
});
const pos = (legs: Leg[], m: Partial<MarketInputs> = {}): Position => ({
  legs,
  market: { ...market, ...m },
});

// ─── The reference screenshot: TEM cash-secured put ───────────────────────
describe('reproduces the reference cash-secured put', () => {
  // Sell 1 × 75 put for 7.625, 47 days, underlying 76.63.
  const p = pos(
    [leg({ kind: 'put', action: 'sell', strike: 75, premium: 7.625, daysToExpiry: 47, iv: 0.78 })],
    { spot: 76.63 },
  );
  const r = analysePosition(p);

  it('net credit $762.50', () => {
    expect(netCashflow(p)).toBeCloseTo(-762.5, 6);
    expect(r.isCredit).toBe(true);
  });
  it('max profit $762.50', () => expect(r.maxProfit).toBeCloseTo(762.5, 6));
  it('max loss $6,737.50', () => expect(r.maxLoss).toBeCloseTo(-6737.5, 6));
  it('collateral $7,500 — strike × shares', () => expect(r.collateral).toBeCloseTo(7500, 6));
  it('breakeven $67.375', () => {
    expect(r.breakevens).toHaveLength(1);
    expect(r.breakevens[0]).toBeCloseTo(67.375, 3);
  });
  it('a $55 finish loses 18% of max risk, as the grid shows', () => {
    const pl = plAt(p, 55, 47);
    expect(pl).toBeCloseTo(-1237.5, 6);
    expect(pl / Math.abs(r.maxLoss as number)).toBeCloseTo(-0.1837, 4);
  });
  it('short put is positive delta and positive theta', () => {
    expect(r.greeks.delta).toBeGreaterThan(0);
    expect(r.greeks.theta).toBeGreaterThan(0);
    expect(r.greeks.vega).toBeLessThan(0); // short vol
  });
});

// ─── Unbounded detection ──────────────────────────────────────────────────
describe('unbounded profit and loss', () => {
  it('a long call has unlimited upside and a capped loss', () => {
    const r = analysePosition(pos([leg({ kind: 'call', strike: 105, premium: 2 })]));
    expect(r.maxProfit).toBeNull();
    expect(r.maxLoss).toBeCloseTo(-200, 6);
    expect(r.breakevens[0]).toBeCloseTo(107, 3);
  });

  it('a naked short call has unlimited loss and no definable collateral', () => {
    const r = analysePosition(pos([leg({ kind: 'call', action: 'sell', strike: 105, premium: 2 })]));
    expect(r.maxLoss).toBeNull();
    expect(r.maxProfit).toBeCloseTo(200, 6);
    expect(r.collateral).toBeNull();
  });

  it('a long put is capped both ways — the underlying stops at zero', () => {
    const r = analysePosition(pos([leg({ kind: 'put', strike: 95, premium: 2 })]));
    expect(r.maxProfit).toBeCloseTo(9300, 6);
    expect(r.maxLoss).toBeCloseTo(-200, 6);
  });
});

// ─── Spreads ──────────────────────────────────────────────────────────────
describe('vertical spread', () => {
  // Bull put spread: sell the 100 put for 5, buy the 95 put for 2.
  const p = pos([
    leg({ kind: 'put', action: 'sell', strike: 100, premium: 5 }),
    leg({ kind: 'put', action: 'buy', strike: 95, premium: 2 }),
  ]);
  const r = analysePosition(p);

  it('collects a $300 credit', () => expect(r.netCashflow).toBeCloseTo(-300, 6));
  it('max profit is the credit', () => expect(r.maxProfit).toBeCloseTo(300, 6));
  it('max loss is width minus credit', () => expect(r.maxLoss).toBeCloseTo(-200, 6));
  it('collateral is the width of the spread', () => expect(r.collateral).toBeCloseTo(500, 6));
  it('breaks even at the short strike less the credit', () => {
    expect(r.breakevens).toHaveLength(1);
    expect(r.breakevens[0]).toBeCloseTo(97, 3);
  });
});

describe('iron condor', () => {
  const condor = () =>
    pos([
      leg({ kind: 'put', action: 'sell', strike: 95, premium: 2 }),
      leg({ kind: 'put', action: 'buy', strike: 90, premium: 1 }),
      leg({ kind: 'call', action: 'sell', strike: 105, premium: 2 }),
      leg({ kind: 'call', action: 'buy', strike: 110, premium: 1 }),
    ]);
  const r = analysePosition(condor());

  it('has two breakevens', () => {
    expect(r.breakevens).toHaveLength(2);
    expect(r.breakevens[0]).toBeCloseTo(93, 2);
    expect(r.breakevens[1]).toBeCloseTo(107, 2);
  });
  it('is risk-defined on both sides', () => {
    expect(r.maxProfit).toBeCloseTo(200, 6);
    expect(r.maxLoss).toBeCloseTo(-300, 6);
  });
  it('profits strictly between the breakevens and loses outside them', () => {
    const p = condor();
    const [lo, hi] = r.breakevens;
    expect(plAt(p, (lo + hi) / 2, 30)).toBeGreaterThan(0); // inside the tent
    expect(plAt(p, lo - 1, 30)).toBeLessThan(0);
    expect(plAt(p, hi + 1, 30)).toBeLessThan(0);
    expect(plAt(p, 80, 30)).toBeCloseTo(-300, 6); // beyond the long put wing
    expect(plAt(p, 130, 30)).toBeCloseTo(-300, 6); // beyond the long call wing
  });
});

describe('covered call', () => {
  const p = pos([
    leg({ kind: 'stock', action: 'buy', quantity: 100, premium: 100, strike: undefined, daysToExpiry: undefined, iv: undefined }),
    leg({ kind: 'call', action: 'sell', strike: 105, premium: 2 }),
  ]);
  const r = analysePosition(p);

  it('nets a $9,800 debit', () => expect(r.netCashflow).toBeCloseTo(9800, 6));
  it('caps profit at the strike', () => expect(r.maxProfit).toBeCloseTo(700, 6));
  it('loses everything if the stock goes to zero', () => expect(r.maxLoss).toBeCloseTo(-9800, 6));
  it('breaks even at the cost basis less the premium', () => {
    expect(r.breakevens[0]).toBeCloseTo(98, 2);
  });
  it('is net long delta but less than the shares alone', () => {
    expect(r.greeks.delta).toBeGreaterThan(0);
    expect(r.greeks.delta).toBeLessThan(100);
  });
});

// ─── Mixed expiries ───────────────────────────────────────────────────────
describe('calendar spread (different expiries per leg)', () => {
  const p = pos([
    leg({ kind: 'call', action: 'sell', strike: 100, premium: 2, daysToExpiry: 30 }),
    leg({ kind: 'call', action: 'buy', strike: 100, premium: 4, daysToExpiry: 60 }),
  ]);
  const r = analysePosition(p);

  it('is flagged as multi-expiry', () => {
    expect(allSameExpiry(p)).toBe(false);
    expect(r.singleExpiry).toBe(false);
  });
  it('analyses to the nearest expiry', () => expect(horizonDays(p)).toBe(30));
  it('still has the far leg carrying time value at the near expiry', () => {
    // The sold leg is worthless at 30 days; the bought leg has 30 days left.
    expect(positionValue(p, 100, 30)).toBeGreaterThan(0);
  });
  it('produces finite, sane numbers', () => {
    expect(Number.isFinite(r.maxLoss as number)).toBe(true);
    expect(r.matrix.cells.every((row) => row.every((c) => Number.isFinite(c.pl)))).toBe(true);
  });
});

// ─── Matrix ───────────────────────────────────────────────────────────────
describe('payoff matrix', () => {
  const p = pos([leg({ kind: 'put', action: 'sell', strike: 95, premium: 2, daysToExpiry: 30 })]);
  const r = analysePosition(p, { rows: 11, columns: 7, rangePct: 0.2 });

  it('spans today to the horizon', () => {
    expect(r.matrix.days[0]).toBe(0);
    expect(r.matrix.days.at(-1)).toBe(30);
    expect(r.matrix.days).toHaveLength(7);
  });
  it('lists prices high to low, like the reference grid', () => {
    const prices = r.matrix.prices;
    expect(prices[0]).toBeGreaterThan(prices.at(-1) as number);
    expect(prices.every((x) => x > 0)).toBe(true);
  });
  it('the final column is the expiration payoff — intrinsic only', () => {
    const last = r.matrix.days.length - 1;
    r.matrix.prices.forEach((price, row) => {
      expect(r.matrix.cells[row][last].pl).toBeCloseTo(plAt(p, price, 30), 6);
    });
  });
  it('today column still carries time value, so it differs from expiry', () => {
    const mid = Math.floor(r.matrix.prices.length / 2);
    expect(r.matrix.cells[mid][0].pl).not.toBeCloseTo(r.matrix.cells[mid].at(-1)!.pl, 2);
  });
});

// ─── Probability and IV multiplier ────────────────────────────────────────
describe('probability of profit', () => {
  it('is between 0 and 1 and higher for a further out-of-the-money short put', () => {
    const near = analysePosition(pos([leg({ kind: 'put', action: 'sell', strike: 99, premium: 3 })]));
    const far = analysePosition(pos([leg({ kind: 'put', action: 'sell', strike: 80, premium: 1 })]));
    for (const r of [near, far]) {
      expect(r.probabilityOfProfit).toBeGreaterThanOrEqual(0);
      expect(r.probabilityOfProfit).toBeLessThanOrEqual(1);
    }
    expect(far.probabilityOfProfit as number).toBeGreaterThan(near.probabilityOfProfit as number);
  });
});

describe('IV multiplier', () => {
  it('raising volatility helps a long option and hurts a short one, before expiry', () => {
    const longCall = pos([leg({ kind: 'call', strike: 105, premium: 2 })]);
    const crushed = { ...longCall, market: { ...longCall.market, ivMultiplier: 0.5 } };
    expect(plAt(longCall, 100, 0)).toBeGreaterThan(plAt(crushed, 100, 0));
  });
  it('has no effect at expiration, where only intrinsic value remains', () => {
    const p = pos([leg({ kind: 'call', strike: 105, premium: 2 })]);
    const doubled = { ...p, market: { ...p.market, ivMultiplier: 2 } };
    expect(plAt(p, 120, 30)).toBeCloseTo(plAt(doubled, 120, 30), 9);
  });
});

describe('net Greeks', () => {
  it('a long and short of the same contract cancel out', () => {
    const p = pos([
      leg({ kind: 'call', action: 'buy', strike: 100, premium: 2 }),
      leg({ kind: 'call', action: 'sell', strike: 100, premium: 2 }),
    ]);
    const g = netGreeks(p);
    for (const v of [g.delta, g.gamma, g.theta, g.vega, g.rho]) expect(v).toBeCloseTo(0, 9);
  });
  it('100 shares of stock is exactly 100 delta and nothing else', () => {
    const g = netGreeks(
      pos([leg({ kind: 'stock', quantity: 100, premium: 100, strike: undefined, daysToExpiry: undefined, iv: undefined })]),
    );
    expect(g.delta).toBe(100);
    expect(g.gamma).toBe(0);
    expect(g.theta).toBe(0);
  });
});
