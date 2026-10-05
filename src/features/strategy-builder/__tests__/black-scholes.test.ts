import { describe, it, expect } from 'vitest';
import { bsGreeks, bsPrice, intrinsic, normCdf, normPdf } from '../black-scholes';
import type { BsInputs } from '../black-scholes';

// The classic textbook case: S=100, K=100, 1 year, r=5%, no dividend, vol 20%.
// Call 10.4506, put 5.5735 — values any options reference will confirm.
const base: BsInputs = {
  spot: 100,
  strike: 100,
  years: 1,
  rate: 0.05,
  dividendYield: 0,
  volatility: 0.2,
  type: 'call',
};

describe('normal distribution helpers', () => {
  it('matches known CDF values', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 7);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 4);
    expect(normCdf(-1.96)).toBeCloseTo(0.025, 4);
    expect(normCdf(0.35)).toBeCloseTo(0.63683, 4);
  });
  it('is symmetric', () => {
    for (const x of [0.1, 0.8, 1.5, 2.6]) {
      expect(normCdf(x) + normCdf(-x)).toBeCloseTo(1, 6);
    }
  });
  it('matches known PDF values', () => {
    expect(normPdf(0)).toBeCloseTo(0.398942, 6);
    expect(normPdf(0.35)).toBeCloseTo(0.375240, 6);
  });
});

describe('bsPrice — textbook values', () => {
  it('prices the reference call', () => {
    expect(bsPrice(base)).toBeCloseTo(10.4506, 3);
  });
  it('prices the reference put', () => {
    expect(bsPrice({ ...base, type: 'put' })).toBeCloseTo(5.5735, 3);
  });

  it('satisfies put-call parity', () => {
    // C − P = S·e^(−qT) − K·e^(−rT)
    for (const strike of [80, 95, 100, 115]) {
      const c = bsPrice({ ...base, strike, type: 'call' });
      const p = bsPrice({ ...base, strike, type: 'put' });
      const expected =
        base.spot * Math.exp(-base.dividendYield * base.years) -
        strike * Math.exp(-base.rate * base.years);
      expect(c - p).toBeCloseTo(expected, 6);
    }
  });

  it('is never worth less than intrinsic value', () => {
    for (const spot of [60, 90, 100, 110, 140]) {
      expect(bsPrice({ ...base, spot })).toBeGreaterThanOrEqual(intrinsic(spot, 100, 'call') - 1e-9);
    }
  });

  it('collapses to intrinsic at expiry', () => {
    expect(bsPrice({ ...base, spot: 115, years: 0 })).toBe(15);
    expect(bsPrice({ ...base, spot: 90, years: 0 })).toBe(0);
    expect(bsPrice({ ...base, spot: 90, years: 0, type: 'put' })).toBe(10);
  });

  it('collapses to intrinsic at zero volatility', () => {
    expect(bsPrice({ ...base, spot: 115, volatility: 0 })).toBe(15);
  });

  it('rises with volatility and with time', () => {
    expect(bsPrice({ ...base, volatility: 0.4 })).toBeGreaterThan(bsPrice(base));
    expect(bsPrice({ ...base, years: 2 })).toBeGreaterThan(bsPrice(base));
  });

  it('handles degenerate inputs without NaN', () => {
    for (const bad of [{ spot: 0 }, { strike: 0 }, { years: -1 }]) {
      expect(Number.isFinite(bsPrice({ ...base, ...bad }))).toBe(true);
    }
  });
});

describe('bsGreeks — textbook values', () => {
  const g = bsGreeks(base);
  const gp = bsGreeks({ ...base, type: 'put' });

  it('delta', () => {
    expect(g.delta).toBeCloseTo(0.6368, 3);
    expect(gp.delta).toBeCloseTo(-0.3632, 3);
  });
  it('call and put delta differ by one (no dividend)', () => {
    expect(g.delta - gp.delta).toBeCloseTo(1, 6);
  });
  it('gamma and vega are shared by calls and puts', () => {
    expect(g.gamma).toBeCloseTo(0.018762, 5);
    expect(gp.gamma).toBeCloseTo(g.gamma, 9);
    expect(g.vega).toBeCloseTo(0.37524, 4); // per 1 percentage point
    expect(gp.vega).toBeCloseTo(g.vega, 9);
  });
  it('theta is negative for a long option, per day', () => {
    expect(g.theta).toBeCloseTo(-6.414 / 365, 5);
    expect(g.theta).toBeLessThan(0);
  });
  it('rho is positive for calls, negative for puts', () => {
    expect(g.rho).toBeGreaterThan(0);
    expect(gp.rho).toBeLessThan(0);
  });

  it('delta approaches 1 deep in the money and 0 deep out', () => {
    expect(bsGreeks({ ...base, spot: 1000 }).delta).toBeCloseTo(1, 2);
    expect(bsGreeks({ ...base, spot: 10 }).delta).toBeCloseTo(0, 2);
  });

  it('matches a numerical derivative of the price', () => {
    // 4dp is the honest tolerance: the CDF approximation carries ~1.5e-7 of
    // error, which a central difference divides by 2h and amplifies.
    const h = 0.1;
    const up = bsPrice({ ...base, spot: base.spot + h });
    const dn = bsPrice({ ...base, spot: base.spot - h });
    expect((up - dn) / (2 * h)).toBeCloseTo(g.delta, 4);
  });

  it('gamma matches a numerical second derivative', () => {
    const h = 0.5;
    const up = bsPrice({ ...base, spot: base.spot + h });
    const mid = bsPrice(base);
    const dn = bsPrice({ ...base, spot: base.spot - h });
    expect((up - 2 * mid + dn) / (h * h)).toBeCloseTo(g.gamma, 4);
  });

  it('at expiry only delta survives', () => {
    const e = bsGreeks({ ...base, spot: 120, years: 0 });
    expect(e.delta).toBe(1);
    expect(e.gamma).toBe(0);
    expect(e.theta).toBe(0);
    expect(e.vega).toBe(0);
  });
});
