// Black–Scholes pricing and Greeks. Pure arithmetic — no data, no network.
//
// This is what lets the builder value a position *before* expiration. Our other
// options tool only knows intrinsic value, which is the last column of a payoff
// matrix; everything to the left of it needs a model.
//
// Caveats, stated here because they are inherent rather than oversights:
//  - Prices European exercise. US equity options are American, so the early
//    exercise premium (mostly ITM puts, and calls around dividends) is missing.
//  - One volatility per leg. No surface, no term structure.
//  - Continuous dividend yield q, not discrete dividend dates.

export type OptionType = 'call' | 'put';

export interface BsInputs {
  /** Spot price of the underlying. */
  spot: number;
  strike: number;
  /** Time to expiration in YEARS. */
  years: number;
  /** Annual risk-free rate as a fraction (0.04 = 4%). */
  rate: number;
  /** Annual continuous dividend yield as a fraction. */
  dividendYield: number;
  /** Annualised implied volatility as a fraction (0.78 = 78%). */
  volatility: number;
  type: OptionType;
}

export interface Greeks {
  /** Change in option price per 1.00 move in the underlying. */
  delta: number;
  /** Change in delta per 1.00 move in the underlying. */
  gamma: number;
  /** Change in option price per CALENDAR DAY. */
  theta: number;
  /** Change in option price per 1 percentage point of volatility. */
  vega: number;
  /** Change in option price per 1 percentage point of interest rate. */
  rho: number;
}

/** Standard normal PDF. */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal CDF, via the Abramowitz & Stegun 7.1.26 error-function
 * approximation. Accurate to about 1.5e-7, far beyond what option prices in
 * cents require.
 */
export function normCdf(x: number): number {
  if (!Number.isFinite(x)) return x > 0 ? 1 : 0;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * z);
  const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1 + sign * erf);
}

/** Value of the option if it expired right now. */
export function intrinsic(spot: number, strike: number, type: OptionType): number {
  return type === 'call' ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
}

function dOne(i: BsInputs): number {
  const { spot, strike, years, rate, dividendYield, volatility } = i;
  return (
    (Math.log(spot / strike) + (rate - dividendYield + (volatility * volatility) / 2) * years) /
    (volatility * Math.sqrt(years))
  );
}

/** Theoretical price per share. Falls back to intrinsic at expiry or zero vol. */
export function bsPrice(i: BsInputs): number {
  const { spot, strike, years, rate, dividendYield, volatility, type } = i;
  if (!(spot > 0) || !(strike > 0)) return 0;
  if (!(years > 0) || !(volatility > 0)) return intrinsic(spot, strike, type);

  const d1 = dOne(i);
  const d2 = d1 - volatility * Math.sqrt(years);
  const dfQ = Math.exp(-dividendYield * years);
  const dfR = Math.exp(-rate * years);

  return type === 'call'
    ? spot * dfQ * normCdf(d1) - strike * dfR * normCdf(d2)
    : strike * dfR * normCdf(-d2) - spot * dfQ * normCdf(-d1);
}

/** Greeks per share, in the display units documented on the Greeks type. */
export function bsGreeks(i: BsInputs): Greeks {
  const { spot, strike, years, rate, dividendYield, volatility, type } = i;
  const zero: Greeks = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  if (!(spot > 0) || !(strike > 0)) return zero;

  // At expiry the position is pure intrinsic: delta is 0 or ±1, the rest vanish.
  if (!(years > 0) || !(volatility > 0)) {
    const itm = type === 'call' ? spot > strike : spot < strike;
    return { ...zero, delta: itm ? (type === 'call' ? 1 : -1) : 0 };
  }

  const sqrtT = Math.sqrt(years);
  const d1 = dOne(i);
  const d2 = d1 - volatility * sqrtT;
  const dfQ = Math.exp(-dividendYield * years);
  const dfR = Math.exp(-rate * years);
  const pdf = normPdf(d1);

  const delta = type === 'call' ? dfQ * normCdf(d1) : dfQ * (normCdf(d1) - 1);
  const gamma = (dfQ * pdf) / (spot * volatility * sqrtT);
  const vegaPerUnitVol = spot * dfQ * pdf * sqrtT;

  const shared = -(spot * dfQ * pdf * volatility) / (2 * sqrtT);
  const thetaPerYear =
    type === 'call'
      ? shared - rate * strike * dfR * normCdf(d2) + dividendYield * spot * dfQ * normCdf(d1)
      : shared + rate * strike * dfR * normCdf(-d2) - dividendYield * spot * dfQ * normCdf(-d1);

  const rhoPerUnitRate =
    type === 'call' ? strike * years * dfR * normCdf(d2) : -strike * years * dfR * normCdf(-d2);

  return {
    delta,
    gamma,
    theta: thetaPerYear / 365,
    vega: vegaPerUnitVol / 100,
    rho: rhoPerUnitRate / 100,
  };
}
