// Pure single-leg option maths. No React, no DOM.
//
// Every figure here is the value **at expiration** (intrinsic value only). An
// option's market price before expiration also carries time value, so a
// position closed early will differ — that is a limitation of this model, not
// an oversight, and the UI says so.

import type {
  CashFlow,
  Moneyness,
  OptionInput,
  OptionResult,
  OptionStrategy,
  PayoffPoint,
  ScenarioRow,
} from './types';

/** Within half a percent of the strike counts as at-the-money. */
const ATM_BAND = 0.005;

export function isSeller(strategy: OptionStrategy): boolean {
  return strategy === 'cash-secured-put' || strategy === 'covered-call';
}

export function isCallStrategy(strategy: OptionStrategy): boolean {
  return strategy === 'long-call' || strategy === 'covered-call';
}

export function cashFlowOf(strategy: OptionStrategy): CashFlow {
  return isSeller(strategy) ? 'credit' : 'debit';
}

/** Covered calls are the only strategy where you already hold the shares. */
export function usesCostBasis(strategy: OptionStrategy): boolean {
  return strategy === 'covered-call';
}

function moneynessOf(strategy: OptionStrategy, price: number, strike: number): Moneyness {
  if (price <= 0 || strike <= 0) return 'ATM';
  if (Math.abs(price - strike) / price <= ATM_BAND) return 'ATM';
  const callLike = isCallStrategy(strategy);
  const inTheMoney = callLike ? price > strike : price < strike;
  return inTheMoney ? 'ITM' : 'OTM';
}

/** Intrinsic value per share of the *option itself*, ignoring who holds it. */
export function intrinsicValue(strategy: OptionStrategy, price: number, strike: number): number {
  return isCallStrategy(strategy) ? Math.max(0, price - strike) : Math.max(0, strike - price);
}

export function breakevenPrice(input: OptionInput): number {
  const { strategy, strike, premium, costBasis } = input;
  switch (strategy) {
    case 'long-call':
      return strike + premium;
    case 'long-put':
    case 'cash-secured-put':
      // Selling a put and buying one share the same breakeven: below it the
      // put seller is losing, above it the put buyer is.
      return strike - premium;
    case 'covered-call':
      // You already own the shares, so the premium cushions your cost basis.
      return costBasis - premium;
  }
}

/** Profit or loss per share at expiration, for a given price of the underlying. */
export function plPerShareAt(input: OptionInput, price: number): number {
  const { strategy, strike, premium, costBasis } = input;
  switch (strategy) {
    case 'long-call':
      return Math.max(0, price - strike) - premium;
    case 'long-put':
      return Math.max(0, strike - price) - premium;
    case 'cash-secured-put':
      return premium - Math.max(0, strike - price);
    case 'covered-call':
      // Shares + premium, minus what the call costs you above the strike.
      return price - costBasis + premium - Math.max(0, price - strike);
  }
}

function buildPayoff(input: OptionInput, shares: number, breakeven: number): PayoffPoint[] {
  const anchors = [input.currentPrice, input.strike, breakeven].filter((v) => v > 0);
  const lo = Math.max(0, Math.min(...anchors) * 0.7);
  const hi = Math.max(...anchors) * 1.3;
  const steps = 60;
  const out: PayoffPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const price = lo + ((hi - lo) * i) / steps;
    out.push({ price, pl: plPerShareAt(input, price) * shares });
  }
  return out;
}

function buildScenarios(input: OptionInput, shares: number, breakeven: number): ScenarioRow[] {
  const s = input.currentPrice;
  const raw: { price: number; note?: string }[] = [
    { price: s * 0.8 },
    { price: s * 0.9 },
    { price: breakeven, note: 'Breakeven' },
    { price: s, note: 'Current price' },
    { price: input.strike, note: 'Strike' },
    { price: s * 1.1 },
    { price: s * 1.2 },
  ];

  const seen = new Map<string, { price: number; note?: string }>();
  for (const row of raw) {
    if (!(row.price > 0)) continue;
    const key = row.price.toFixed(2);
    const existing = seen.get(key);
    if (existing) {
      // Keep the more meaningful label when two anchors land on the same price.
      if (!existing.note && row.note) existing.note = row.note;
      continue;
    }
    seen.set(key, { ...row });
  }

  return [...seen.values()]
    .sort((a, b) => a.price - b.price)
    .map(({ price, note }) => ({
      price,
      plPerShare: plPerShareAt(input, price),
      plTotal: plPerShareAt(input, price) * shares,
      note,
    }));
}

/** Simple (non-compounded) annualisation — the convention option sellers use. */
function annualize(ret: number, days: number): number | null {
  if (!(days > 0)) return null;
  return ret * (365 / days);
}

export function calculateOption(input: OptionInput): OptionResult {
  const { strategy, currentPrice, strike, premium, daysToExpiry, costBasis } = input;
  const shares = Math.max(0, input.contracts) * Math.max(0, input.sharesPerContract);

  const breakeven = breakevenPrice(input);
  const intrinsicPerShare = intrinsicValue(strategy, currentPrice, strike);
  const extrinsicPerShare = Math.max(0, premium - intrinsicPerShare);
  const premiumTotal = premium * shares;

  const plTodayPerShare = plPerShareAt(input, currentPrice);
  const plTodayTotal = plTodayPerShare * shares;

  const moveToBreakevenPct = currentPrice > 0 ? (breakeven - currentPrice) / currentPrice : 0;
  const strikeVsCurrentPct = currentPrice > 0 ? (strike - currentPrice) / currentPrice : 0;

  let maxProfit: number | null;
  let maxLoss: number | null;
  let capital: number;
  let returnOnCapital: number;
  let annualizedReturn: number | null = null;
  const extras: Partial<OptionResult> = {};

  switch (strategy) {
    case 'long-call': {
      maxProfit = null; // no ceiling on the underlying
      maxLoss = -premiumTotal;
      capital = premiumTotal;
      // Matches the spreadsheet's "return on premium": what the debit is worth
      // today versus what it cost.
      returnOnCapital = premiumTotal > 0 ? plTodayTotal / premiumTotal : 0;
      break;
    }
    case 'long-put': {
      maxProfit = (strike - premium) * shares; // underlying to zero
      maxLoss = -premiumTotal;
      capital = premiumTotal;
      returnOnCapital = premiumTotal > 0 ? plTodayTotal / premiumTotal : 0;
      break;
    }
    case 'cash-secured-put': {
      maxProfit = premiumTotal;
      maxLoss = -(strike - premium) * shares; // underlying to zero
      capital = strike * shares; // cash set aside to buy the shares
      returnOnCapital = strike > 0 ? premium / strike : 0;
      annualizedReturn = annualize(returnOnCapital, daysToExpiry);
      extras.discountIfAssignedPct =
        currentPrice > 0 ? (breakeven - currentPrice) / currentPrice : 0;
      break;
    }
    case 'covered-call': {
      const ifCalledProfit = (strike - costBasis + premium) * shares;
      maxProfit = ifCalledProfit;
      maxLoss = -(costBasis - premium) * shares; // underlying to zero
      capital = currentPrice * shares; // market value tied up today
      returnOnCapital = currentPrice > 0 ? premium / currentPrice : 0; // static return
      annualizedReturn = annualize(returnOnCapital, daysToExpiry);
      extras.downsideProtectionPct = currentPrice > 0 ? premium / currentPrice : 0;
      extras.upsideCapPct = currentPrice > 0 ? (strike - currentPrice) / currentPrice : 0;
      extras.ifCalledProfit = ifCalledProfit;
      extras.ifCalledReturn = costBasis > 0 ? (strike - costBasis + premium) / costBasis : 0;
      extras.ifCalledReturnAnnualized = annualize(extras.ifCalledReturn, daysToExpiry) ?? undefined;
      break;
    }
  }

  return {
    strategy,
    cashFlow: cashFlowOf(strategy),
    shares,
    breakeven,
    moveToBreakevenPct,
    moneyness: moneynessOf(strategy, currentPrice, strike),
    strikeVsCurrentPct,
    intrinsicPerShare,
    extrinsicPerShare,
    premiumTotal,
    plTodayPerShare,
    plTodayTotal,
    maxProfit,
    maxLoss,
    capital,
    returnOnCapital,
    annualizedReturn,
    ...extras,
    payoff: buildPayoff(input, shares, breakeven),
    scenarios: buildScenarios(input, shares, breakeven),
  };
}
