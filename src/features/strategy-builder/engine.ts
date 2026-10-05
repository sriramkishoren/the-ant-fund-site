// Multi-leg position maths. Pure — no React, no DOM, no network.

import { bsGreeks, bsPrice, intrinsic, normCdf, type Greeks } from './black-scholes';
import type {
  CurvePoint,
  Leg,
  MatrixCell,
  PayoffMatrix,
  Position,
  StrategyResult,
} from './types';

const DAYS_PER_YEAR = 365;
const ZERO_GREEKS: Greeks = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };

/** Options control a lot of shares; stock legs are counted in shares already. */
export function legMultiplier(leg: Leg, sharesPerContract: number): number {
  return leg.kind === 'stock' ? 1 : sharesPerContract;
}

export function legSign(leg: Leg): number {
  return leg.action === 'buy' ? 1 : -1;
}

/** Signed share count — the scale factor for a leg's price and Greeks. */
function legScale(leg: Leg, sharesPerContract: number): number {
  return legSign(leg) * leg.quantity * legMultiplier(leg, sharesPerContract);
}

/** Cash moved at entry. Positive = debit paid, negative = credit received. */
export function netCashflow(position: Position): number {
  return position.legs.reduce(
    (sum, leg) => sum + legScale(leg, position.market.sharesPerContract) * leg.premium,
    0,
  );
}

/** Theoretical value per share of one leg, at a price and a day offset. */
export function legValue(leg: Leg, spot: number, atDay: number, position: Position): number {
  if (leg.kind === 'stock') return spot;

  const strike = leg.strike ?? 0;
  const daysLeft = (leg.daysToExpiry ?? 0) - atDay;
  // Past its own expiry this leg is settled: intrinsic value only.
  if (daysLeft <= 0) return intrinsic(spot, strike, leg.kind);

  return bsPrice({
    spot,
    strike,
    years: daysLeft / DAYS_PER_YEAR,
    rate: position.market.rate,
    dividendYield: position.market.dividendYield,
    volatility: (leg.iv ?? 0) * position.market.ivMultiplier,
    type: leg.kind,
  });
}

/** What the whole position is worth at a price and a day offset. */
export function positionValue(position: Position, spot: number, atDay: number): number {
  return position.legs.reduce(
    (sum, leg) =>
      sum +
      legScale(leg, position.market.sharesPerContract) * legValue(leg, spot, atDay, position),
    0,
  );
}

/** Profit or loss versus the entry cost. */
export function plAt(position: Position, spot: number, atDay: number): number {
  return positionValue(position, spot, atDay) - netCashflow(position);
}

/** Net Greeks across the position, scaled by quantity and multiplier. */
export function netGreeks(position: Position, atDay = 0): Greeks {
  return position.legs.reduce<Greeks>((acc, leg) => {
    if (leg.kind === 'stock') {
      // Stock is pure delta: one unit per share.
      return { ...acc, delta: acc.delta + legScale(leg, position.market.sharesPerContract) };
    }
    const daysLeft = (leg.daysToExpiry ?? 0) - atDay;
    const g = bsGreeks({
      spot: position.market.spot,
      strike: leg.strike ?? 0,
      years: Math.max(0, daysLeft) / DAYS_PER_YEAR,
      rate: position.market.rate,
      dividendYield: position.market.dividendYield,
      volatility: (leg.iv ?? 0) * position.market.ivMultiplier,
      type: leg.kind,
    });
    const k = legScale(leg, position.market.sharesPerContract);
    return {
      delta: acc.delta + k * g.delta,
      gamma: acc.gamma + k * g.gamma,
      theta: acc.theta + k * g.theta,
      vega: acc.vega + k * g.vega,
      rho: acc.rho + k * g.rho,
    };
  }, ZERO_GREEKS);
}

/** Days until the first leg expires — when the position first changes character. */
export function horizonDays(position: Position): number {
  const days = position.legs
    .filter((l) => l.kind !== 'stock')
    .map((l) => l.daysToExpiry ?? 0)
    .filter((d) => d > 0);
  return days.length > 0 ? Math.min(...days) : 30;
}

export function allSameExpiry(position: Position): boolean {
  const days = new Set(
    position.legs.filter((l) => l.kind !== 'stock').map((l) => l.daysToExpiry ?? 0),
  );
  return days.size <= 1;
}

function sortedStrikes(position: Position): number[] {
  return [
    ...new Set(
      position.legs
        .filter((l) => l.kind !== 'stock' && (l.strike ?? 0) > 0)
        .map((l) => l.strike as number),
    ),
  ].sort((a, b) => a - b);
}

/**
 * Slope of the payoff far above the highest strike. Every call is deep in the
 * money there (delta → 1) and every put is worthless, so the slope is a simple
 * signed count. It is what tells us whether profit or loss is unbounded.
 */
function farUpsideSlope(position: Position): number {
  return position.legs.reduce((sum, leg) => {
    const k = legScale(leg, position.market.sharesPerContract);
    if (leg.kind === 'call' || leg.kind === 'stock') return sum + k;
    return sum; // puts are worthless far above every strike
  }, 0);
}

/** Price grid used for extrema and breakevens: dense, with exact strikes included. */
function analysisGrid(position: Position): number[] {
  const strikes = sortedStrikes(position);
  const spot = position.market.spot;
  const hi = Math.max(spot, ...(strikes.length ? strikes : [spot])) * 3;
  const grid = new Set<number>([0, ...strikes]);
  const steps = 1200;
  for (let i = 0; i <= steps; i++) grid.add((hi * i) / steps);
  // Nudge either side of each strike so a kink is never missed.
  for (const k of strikes) {
    grid.add(Math.max(0, k - 1e-4));
    grid.add(k + 1e-4);
  }
  return [...grid].sort((a, b) => a - b);
}

/**
 * Exact for single-expiry positions: the payoff is piecewise linear with kinks
 * only at strikes, and the grid contains every strike, so the extremes are
 * found exactly. For mixed expiries the curve is smooth and this is a dense
 * sample — close, but an approximation.
 */
function extremesAndBreakevens(
  position: Position,
  atDay: number,
): { maxProfit: number | null; maxLoss: number | null; breakevens: number[] } {
  const grid = analysisGrid(position);
  const values = grid.map((p) => plAt(position, p, atDay));

  let maxProfit: number | null = Math.max(...values);
  let maxLoss: number | null = Math.min(...values);

  const slope = farUpsideSlope(position);
  // The downside is always bounded, because the underlying cannot go below zero.
  if (slope > 1e-9) maxProfit = null;
  if (slope < -1e-9) maxLoss = null;

  const breakevens: number[] = [];
  for (let i = 1; i < grid.length; i++) {
    const y0 = values[i - 1];
    const y1 = values[i];
    if (y0 === 0) {
      breakevens.push(grid[i - 1]);
      continue;
    }
    if ((y0 < 0 && y1 > 0) || (y0 > 0 && y1 < 0)) {
      // Linear between grid points — exact where the payoff itself is linear.
      breakevens.push(grid[i - 1] + ((grid[i] - grid[i - 1]) * -y0) / (y1 - y0));
    }
  }

  // Collapse near-duplicates from the nudged points around each strike.
  const unique: number[] = [];
  for (const b of breakevens) {
    if (!unique.some((u) => Math.abs(u - b) < 1e-3)) unique.push(b);
  }

  return { maxProfit, maxLoss, breakevens: unique.sort((a, b) => a - b) };
}

/** Quantity-weighted average IV, used as the single vol for the probability model. */
function representativeIv(position: Position): number {
  let weighted = 0;
  let weight = 0;
  for (const leg of position.legs) {
    if (leg.kind === 'stock' || !leg.iv) continue;
    const w = Math.abs(leg.quantity * legMultiplier(leg, position.market.sharesPerContract));
    weighted += leg.iv * position.market.ivMultiplier * w;
    weight += w;
  }
  return weight > 0 ? weighted / weight : 0;
}

/**
 * Probability the position finishes profitable, under the same lognormal
 * assumption Black–Scholes uses. Model-based, not a forecast.
 */
function probabilityOfProfit(
  position: Position,
  atDay: number,
  breakevens: number[],
): number | null {
  const sigma = representativeIv(position);
  const years = atDay / DAYS_PER_YEAR;
  const spot = position.market.spot;
  if (!(sigma > 0) || !(years > 0) || !(spot > 0)) return null;

  const drift = (position.market.rate - position.market.dividendYield - (sigma * sigma) / 2) * years;
  const vol = sigma * Math.sqrt(years);
  // P(underlying ≤ x) at the horizon.
  const cdf = (x: number) => (x <= 0 ? 0 : normCdf((Math.log(x / spot) - drift) / vol));

  // Walk the intervals the breakevens carve out and add up the profitable ones.
  const bounds = [0, ...breakevens, Number.POSITIVE_INFINITY];
  let p = 0;
  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i];
    const hi = bounds[i + 1];
    const probe = Number.isFinite(hi) ? (lo + hi) / 2 : Math.max(spot, lo) * 2;
    if (plAt(position, probe, atDay) > 0) {
      p += (Number.isFinite(hi) ? cdf(hi) : 1) - cdf(lo);
    }
  }
  return Math.min(1, Math.max(0, p));
}

/** Round a step to a readable 1 / 2 / 2.5 / 5 / 10 × 10^n. */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return step * mag;
}

export function buildMatrix(
  position: Position,
  opts: { rangePct: number; rows: number; columns: number },
): PayoffMatrix {
  const horizon = horizonDays(position);
  const spot = position.market.spot;

  const colCount = Math.max(2, Math.min(opts.columns, horizon + 1));
  const days: number[] = [];
  for (let i = 0; i < colCount; i++) {
    days.push(Math.round((horizon * i) / (colCount - 1)));
  }

  const step = niceStep((spot * opts.rangePct * 2) / Math.max(1, opts.rows - 1));
  const mid = Math.round(spot / step) * step;
  const half = Math.floor(opts.rows / 2);
  const prices: number[] = [];
  for (let i = half; i >= -half; i--) {
    const p = mid + i * step;
    if (p > 0) prices.push(Number(p.toFixed(4)));
  }

  const cells: MatrixCell[][] = prices.map((price) =>
    days.map((day) => ({
      pl: plAt(position, price, day),
      value: positionValue(position, price, day),
    })),
  );

  return { days, prices, cells };
}

function curve(position: Position, atDay: number, rangePct: number, points = 90): CurvePoint[] {
  const spot = position.market.spot;
  const lo = Math.max(0, spot * (1 - rangePct));
  const hi = spot * (1 + rangePct);
  const out: CurvePoint[] = [];
  for (let i = 0; i <= points; i++) {
    const price = lo + ((hi - lo) * i) / points;
    out.push({ price, pl: plAt(position, price, atDay) });
  }
  return out;
}

export interface AnalyseOptions {
  rangePct?: number;
  rows?: number;
  columns?: number;
}

export function analysePosition(
  position: Position,
  opts: AnalyseOptions = {},
): StrategyResult {
  const rangePct = opts.rangePct ?? 0.3;
  const rows = opts.rows ?? 21;
  const columns = opts.columns ?? 14;

  const horizon = horizonDays(position);
  const cash = netCashflow(position);
  const { maxProfit, maxLoss, breakevens } = extremesAndBreakevens(position, horizon);

  // Cash set aside on a fully-collateralised basis: the worst case plus any
  // credit taken in. For a cash-secured put this lands on strike × shares; for
  // a vertical it lands on the width. Brokers may require less.
  const collateral = maxLoss === null ? null : Math.abs(maxLoss) + Math.max(0, -cash);

  return {
    netCashflow: cash,
    isCredit: cash < 0,
    maxProfit,
    maxLoss,
    collateral,
    breakevens,
    probabilityOfProfit: probabilityOfProfit(position, horizon, breakevens),
    greeks: netGreeks(position, 0),
    horizonDays: horizon,
    singleExpiry: allSameExpiry(position),
    expirationCurve: curve(position, horizon, rangePct),
    todayCurve: curve(position, 0, rangePct),
    matrix: buildMatrix(position, { rangePct, rows, columns }),
  };
}
