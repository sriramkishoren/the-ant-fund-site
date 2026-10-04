// Turns an OptionResult into the rows each strategy should display. Keeping
// this here means the "which fields appear for which strategy" decision lives
// in one readable place rather than scattered through JSX.

import type { OptionInput, OptionResult } from './types';

export interface MetricRow {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'good' | 'warn';
}

export interface Formatters {
  money: (n: number) => string;
  /** Per-share prices, which need cents. */
  price: (n: number) => string;
  percent: (n: number) => string;
}

const UNLIMITED = 'Unlimited';

function signedTone(n: number): MetricRow['tone'] {
  return n > 0 ? 'good' : n < 0 ? 'warn' : 'neutral';
}

/** The four big numbers at the top. */
export function headlineMetrics(
  r: OptionResult,
  input: OptionInput,
  f: Formatters,
): MetricRow[] {
  const rows: MetricRow[] = [
    {
      label: 'Breakeven',
      value: f.price(r.breakeven),
      hint:
        r.strategy === 'covered-call'
          ? 'Below this, the shares plus premium are worth less than you paid'
          : `${f.percent(r.moveToBreakevenPct)} from today's price`,
    },
    {
      label: 'Max profit',
      value: r.maxProfit === null ? UNLIMITED : f.money(r.maxProfit),
      hint:
        r.maxProfit === null
          ? 'No ceiling — the underlying can keep rising'
          : r.strategy === 'covered-call'
            ? 'If the shares are called away at the strike'
            : r.strategy === 'cash-secured-put'
              ? 'The premium, if it expires worthless'
              : 'If the underlying falls to zero',
      tone: 'good',
    },
    {
      label: 'Max loss',
      value: r.maxLoss === null ? UNLIMITED : f.money(Math.abs(r.maxLoss)),
      hint:
        r.strategy === 'long-call' || r.strategy === 'long-put'
          ? 'The premium you paid — nothing more'
          : 'If the underlying falls to zero',
      tone: 'warn',
    },
  ];

  if (r.strategy === 'long-call' || r.strategy === 'long-put') {
    // Leading with the percentage here reads as a verdict: an out-of-the-money
    // option shows "−100%", which is true only in the sense that it has no
    // intrinsic value *today*. The amount is the honest headline; the rate and
    // the reason belong underneath.
    rows.push({
      label: 'If it expired today',
      value: f.money(r.plTodayTotal),
      hint:
        r.intrinsicPerShare === 0
          ? `${f.percent(r.returnOnCapital)} of the premium — no intrinsic value yet, it is all time value`
          : `${f.percent(r.returnOnCapital)} of the premium paid`,
      tone: signedTone(r.plTodayTotal),
    });
  } else {
    rows.push({
      label: returnLabel(r),
      value: f.percent(r.returnOnCapital),
      hint: returnHint(r, input, f),
      tone: signedTone(r.returnOnCapital),
    });
  }

  return rows;
}

function returnLabel(r: OptionResult): string {
  switch (r.strategy) {
    case 'long-call':
    case 'long-put':
      return 'Return on premium';
    case 'cash-secured-put':
      return 'Return on cash';
    case 'covered-call':
      return 'Static return';
  }
}

function returnHint(r: OptionResult, input: OptionInput, f: Formatters): string {
  switch (r.strategy) {
    case 'long-call':
    case 'long-put':
      return 'If it expired at today’s price';
    case 'cash-secured-put':
      return r.annualizedReturn !== null
        ? `${f.percent(r.annualizedReturn)} annualised over ${input.daysToExpiry} days`
        : 'Premium ÷ cash secured';
    case 'covered-call':
      return r.annualizedReturn !== null
        ? `${f.percent(r.annualizedReturn)} annualised if it expires worthless`
        : 'Premium ÷ today’s share value';
  }
}

/** The full breakdown, mirroring the columns of a spreadsheet model. */
export function detailMetrics(
  r: OptionResult,
  input: OptionInput,
  f: Formatters,
): MetricRow[] {
  const rows: MetricRow[] = [
    {
      label: r.cashFlow === 'debit' ? 'Premium paid' : 'Premium received',
      value: f.money(r.premiumTotal),
      hint: `${f.price(input.premium)} × ${r.shares.toLocaleString()} shares`,
    },
    {
      label: 'Moneyness',
      value: r.moneyness,
      hint: `Strike is ${f.percent(r.strikeVsCurrentPct)} vs today’s price`,
    },
    {
      label: 'Intrinsic value',
      value: f.price(r.intrinsicPerShare),
      hint: 'Per share, if it expired right now',
    },
    {
      label: 'Time value',
      value: f.price(r.extrinsicPerShare),
      hint: 'The part of the premium that decays to zero by expiration',
    },
    { label: capitalLabel(r), value: f.money(r.capital), hint: capitalHint(r) },
  ];

  if (r.strategy === 'cash-secured-put' || r.strategy === 'covered-call') {
    rows.splice(4, 0, {
      label: 'P/L if it expired today',
      value: f.money(r.plTodayTotal),
      hint: `${f.price(r.plTodayPerShare)} per share`,
      tone: signedTone(r.plTodayTotal),
    });
  }

  if (r.strategy === 'cash-secured-put' && r.discountIfAssignedPct !== undefined) {
    rows.push({
      label: 'Effective buy price if assigned',
      value: f.price(r.breakeven),
      hint: `${f.percent(r.discountIfAssignedPct)} vs today’s price`,
    });
  }

  if (r.strategy === 'covered-call') {
    if (r.downsideProtectionPct !== undefined) {
      rows.push({
        label: 'Downside protection',
        value: f.percent(r.downsideProtectionPct),
        hint: 'How far the stock can fall before the premium stops covering it',
      });
    }
    if (r.upsideCapPct !== undefined) {
      rows.push({
        label: 'Upside given up above',
        value: f.price(input.strike),
        hint: `${f.percent(r.upsideCapPct)} above today — gains past the strike go to the buyer`,
      });
    }
    if (r.ifCalledProfit !== undefined && r.ifCalledReturn !== undefined) {
      rows.push({
        label: 'If called away',
        value: f.money(r.ifCalledProfit),
        hint:
          r.ifCalledReturnAnnualized !== undefined
            ? `${f.percent(r.ifCalledReturn)} on cost basis · ${f.percent(r.ifCalledReturnAnnualized)} annualised`
            : `${f.percent(r.ifCalledReturn)} on cost basis`,
        tone: signedTone(r.ifCalledProfit),
      });
    }
  }

  return rows;
}

function capitalLabel(r: OptionResult): string {
  switch (r.strategy) {
    case 'long-call':
    case 'long-put':
      return 'Capital at risk';
    case 'cash-secured-put':
      return 'Cash secured';
    case 'covered-call':
      return 'Share value committed';
  }
}

function capitalHint(r: OptionResult): string {
  switch (r.strategy) {
    case 'long-call':
    case 'long-put':
      return 'The most this position can lose';
    case 'cash-secured-put':
      return 'Strike × shares — set aside to buy if assigned';
    case 'covered-call':
      return 'Today’s market value of the shares you hold';
  }
}
