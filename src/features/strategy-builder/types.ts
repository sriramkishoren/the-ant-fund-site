import type { Greeks } from './black-scholes';

export type LegKind = 'call' | 'put' | 'stock';
export type LegAction = 'buy' | 'sell';

export interface Leg {
  id: string;
  kind: LegKind;
  action: LegAction;
  /** Contracts for options; shares for stock. */
  quantity: number;
  /** Undefined for stock legs. */
  strike?: number;
  /**
   * Calendar days from today until this leg expires. Per-leg, which is what
   * makes calendar and diagonal spreads possible. Undefined for stock.
   * Phase 2 will swap this for real expiration dates off a live chain.
   */
  daysToExpiry?: number;
  /** Entry price per share — the premium, or the share price for stock. */
  premium: number;
  /** Implied volatility as a fraction (0.78 = 78%). Undefined for stock. */
  iv?: number;
}

export interface MarketInputs {
  spot: number;
  /** Annual risk-free rate as a fraction. */
  rate: number;
  /** Annual continuous dividend yield as a fraction. */
  dividendYield: number;
  sharesPerContract: number;
  /** Scales every leg's IV — how you model an earnings crush or expansion. */
  ivMultiplier: number;
}

export interface Position {
  legs: Leg[];
  market: MarketInputs;
}

export interface CurvePoint {
  price: number;
  pl: number;
}

export interface MatrixCell {
  pl: number;
  /** Position value at that price and day, before subtracting entry cost. */
  value: number;
}

export interface PayoffMatrix {
  /** Day offsets from today, ascending; always includes 0 and the horizon. */
  days: number[];
  /** Underlying prices, descending so the grid reads like a chart. */
  prices: number[];
  /** cells[rowIndex][colIndex] — row follows `prices`, column follows `days`. */
  cells: MatrixCell[][];
}

export interface StrategyResult {
  /** Positive = net debit paid; negative = net credit received. */
  netCashflow: number;
  isCredit: boolean;
  /** null means theoretically unbounded. */
  maxProfit: number | null;
  maxLoss: number | null;
  /** Fully-collateralised capital requirement; null when risk is undefined. */
  collateral: number | null;
  /** Can be empty, one, or several — an iron condor has two. */
  breakevens: number[];
  /** Model-based probability the position is profitable at the horizon. */
  probabilityOfProfit: number | null;
  /** Net position Greeks today, already scaled by quantity and multiplier. */
  greeks: Greeks;
  /** Days until the earliest leg expires — the analysis horizon. */
  horizonDays: number;
  /** True when every option leg shares one expiry, so the maths is exact. */
  singleExpiry: boolean;
  expirationCurve: CurvePoint[];
  todayCurve: CurvePoint[];
  matrix: PayoffMatrix;
}
