// Types for the single-leg options calculator. Pure data — no React, no DOM —
// so the maths stays unit-testable.

export type OptionStrategy =
  | 'long-call'
  | 'long-put'
  | 'cash-secured-put'
  | 'covered-call';

export type Moneyness = 'ITM' | 'ATM' | 'OTM';

/** Whether the position is opened for a debit (you pay) or a credit (you receive). */
export type CashFlow = 'debit' | 'credit';

export interface OptionInput {
  strategy: OptionStrategy;
  /** Price of the underlying right now. */
  currentPrice: number;
  strike: number;
  /** Option price per share. */
  premium: number;
  contracts: number;
  /** Shares controlled by one contract — 100 for US equity options, the lot size elsewhere. */
  sharesPerContract: number;
  /** Calendar days until expiration. 0 disables the annualised figures. */
  daysToExpiry: number;
  /** What you paid per share for stock you already own. Covered calls only. */
  costBasis: number;
}

export interface PayoffPoint {
  price: number;
  /** Total profit/loss at expiration, across all contracts. */
  pl: number;
}

export interface ScenarioRow {
  price: number;
  plPerShare: number;
  plTotal: number;
  /** "Breakeven", "Current price", "Strike" — blank for plain price steps. */
  note?: string;
}

export interface OptionResult {
  strategy: OptionStrategy;
  cashFlow: CashFlow;
  /** contracts × sharesPerContract. */
  shares: number;

  breakeven: number;
  /** Move in the underlying needed to reach breakeven, from today's price. */
  moveToBreakevenPct: number;
  moneyness: Moneyness;
  /** Strike relative to the current price — negative when the strike is lower. */
  strikeVsCurrentPct: number;

  intrinsicPerShare: number;
  extrinsicPerShare: number;

  /** Premium paid (debit) or received (credit), across all contracts. */
  premiumTotal: number;
  /** What the position would be worth if it expired at today's price. */
  plTodayPerShare: number;
  plTodayTotal: number;

  /** null means theoretically unlimited. */
  maxProfit: number | null;
  maxLoss: number | null;

  /** Cash at risk, cash secured, or market value committed, depending on strategy. */
  capital: number;
  /** The headline return for this strategy, as a fraction. */
  returnOnCapital: number;
  /** Simple annualisation of a premium-based return; null when it is meaningless. */
  annualizedReturn: number | null;

  // ── Seller-specific ────────────────────────────────────────────────────
  /** Cash-secured put: effective discount to today's price if you are assigned. */
  discountIfAssignedPct?: number;
  /** Covered call: premium as a share of today's price. */
  downsideProtectionPct?: number;
  /** Covered call: upside given up above the strike. */
  upsideCapPct?: number;
  /** Covered call: total profit if the shares are called away. */
  ifCalledProfit?: number;
  ifCalledReturn?: number;
  ifCalledReturnAnnualized?: number;

  payoff: PayoffPoint[];
  scenarios: ScenarioRow[];
}
