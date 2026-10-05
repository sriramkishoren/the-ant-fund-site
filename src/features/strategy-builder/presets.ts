import type { CurrencyCode } from '@/lib/currency';
import type { Leg, MarketInputs, Position } from './types';

export type PresetId =
  | 'long-call'
  | 'long-put'
  | 'cash-secured-put'
  | 'covered-call'
  | 'bull-call-spread'
  | 'bear-put-spread'
  | 'bull-put-spread'
  | 'bear-call-spread'
  | 'straddle'
  | 'strangle'
  | 'iron-condor'
  | 'butterfly'
  | 'calendar';

export interface PresetMeta {
  id: PresetId;
  label: string;
  group: 'Single leg' | 'Vertical spreads' | 'Volatility' | 'Multi-leg';
  blurb: string;
}

export const PRESETS: PresetMeta[] = [
  { id: 'long-call', label: 'Buy a call', group: 'Single leg', blurb: 'Bullish. Loss capped at the premium, upside uncapped.' },
  { id: 'long-put', label: 'Buy a put', group: 'Single leg', blurb: 'Bearish. Loss capped at the premium.' },
  { id: 'cash-secured-put', label: 'Cash-secured put', group: 'Single leg', blurb: 'Collect premium, with cash set aside to buy the shares if assigned.' },
  { id: 'covered-call', label: 'Covered call', group: 'Single leg', blurb: 'Own the shares, sell the upside above the strike for premium.' },
  { id: 'bull-call-spread', label: 'Bull call spread', group: 'Vertical spreads', blurb: 'Bullish, debit, both risk and reward capped.' },
  { id: 'bear-put-spread', label: 'Bear put spread', group: 'Vertical spreads', blurb: 'Bearish, debit, both risk and reward capped.' },
  { id: 'bull-put-spread', label: 'Bull put spread', group: 'Vertical spreads', blurb: 'Bullish, credit. Max loss is the width less the credit.' },
  { id: 'bear-call-spread', label: 'Bear call spread', group: 'Vertical spreads', blurb: 'Bearish, credit. Max loss is the width less the credit.' },
  { id: 'straddle', label: 'Long straddle', group: 'Volatility', blurb: 'Buy a call and a put at the same strike — a bet on a big move either way.' },
  { id: 'strangle', label: 'Long strangle', group: 'Volatility', blurb: 'Cheaper than a straddle, but needs a bigger move.' },
  { id: 'iron-condor', label: 'Iron condor', group: 'Multi-leg', blurb: 'Credit for the underlying staying in a range. Risk defined on both sides.' },
  { id: 'butterfly', label: 'Call butterfly', group: 'Multi-leg', blurb: 'Cheap bet that the underlying pins near the middle strike.' },
  { id: 'calendar', label: 'Calendar spread', group: 'Multi-leg', blurb: 'Sell near-dated, buy far-dated at the same strike — sells time decay.' },
];

let seq = 0;
function mkLeg(l: Omit<Leg, 'id'>): Leg {
  seq += 1;
  return { id: `leg-${seq}`, ...l };
}

/** Round a strike to a sensible increment for the price level. */
function roundStrike(x: number): number {
  const step = x >= 500 ? 10 : x >= 100 ? 5 : x >= 25 ? 1 : 0.5;
  return Math.round(x / step) * step;
}

/**
 * Premiums here are rough stand-ins so a freshly-picked strategy shows a
 * sensible shape immediately. They are not quotes — the whole point of the
 * tool is that you replace them with real numbers.
 */
function approxPremium(spot: number, strike: number, kind: 'call' | 'put', days: number, iv: number): number {
  const t = Math.sqrt(Math.max(days, 1) / 365);
  const atmValue = 0.4 * spot * iv * t;
  const moneyness = kind === 'call' ? spot - strike : strike - spot;
  const value = Math.max(0, moneyness) + atmValue * Math.exp(-Math.abs(moneyness) / (spot * iv * t + 1e-9));
  return Math.max(0.05, Number(value.toFixed(2)));
}

export function buildPreset(id: PresetId, market: MarketInputs, iv = 0.3, days = 45): Position {
  const s = market.spot;
  const up = roundStrike(s * 1.05);
  const down = roundStrike(s * 0.95);
  const farUp = roundStrike(s * 1.1);
  const farDown = roundStrike(s * 0.9);
  const atm = roundStrike(s);
  const prem = (k: number, kind: 'call' | 'put', d = days) => approxPremium(s, k, kind, d, iv);

  const opt = (
    kind: 'call' | 'put',
    action: 'buy' | 'sell',
    strike: number,
    d = days,
  ): Omit<Leg, 'id'> => ({
    kind,
    action,
    quantity: 1,
    strike,
    daysToExpiry: d,
    premium: prem(strike, kind, d),
    iv,
  });

  const legs: Omit<Leg, 'id'>[] = (() => {
    switch (id) {
      case 'long-call':
        return [opt('call', 'buy', up)];
      case 'long-put':
        return [opt('put', 'buy', down)];
      case 'cash-secured-put':
        return [opt('put', 'sell', down)];
      case 'covered-call':
        return [
          { kind: 'stock', action: 'buy', quantity: market.sharesPerContract, premium: s },
          opt('call', 'sell', up),
        ];
      case 'bull-call-spread':
        return [opt('call', 'buy', atm), opt('call', 'sell', farUp)];
      case 'bear-put-spread':
        return [opt('put', 'buy', atm), opt('put', 'sell', farDown)];
      case 'bull-put-spread':
        return [opt('put', 'sell', down), opt('put', 'buy', farDown)];
      case 'bear-call-spread':
        return [opt('call', 'sell', up), opt('call', 'buy', farUp)];
      case 'straddle':
        return [opt('call', 'buy', atm), opt('put', 'buy', atm)];
      case 'strangle':
        return [opt('call', 'buy', up), opt('put', 'buy', down)];
      case 'iron-condor':
        return [
          opt('put', 'sell', down),
          opt('put', 'buy', farDown),
          opt('call', 'sell', up),
          opt('call', 'buy', farUp),
        ];
      case 'butterfly':
        return [
          opt('call', 'buy', down),
          { ...opt('call', 'sell', atm), quantity: 2 },
          opt('call', 'buy', up),
        ];
      case 'calendar':
        return [opt('call', 'sell', atm, days), opt('call', 'buy', atm, days * 2)];
    }
  })();

  return { legs: legs.map(mkLeg), market };
}

export function defaultMarket(currency: CurrencyCode): MarketInputs {
  return currency === 'INR'
    ? { spot: 1400, rate: 0.065, dividendYield: 0, sharesPerContract: 100, ivMultiplier: 1 }
    : { spot: 100, rate: 0.04, dividendYield: 0, sharesPerContract: 100, ivMultiplier: 1 };
}

export function newLeg(market: MarketInputs, iv = 0.3, days = 45): Leg {
  return mkLeg({
    kind: 'call',
    action: 'buy',
    quantity: 1,
    strike: roundStrike(market.spot),
    daysToExpiry: days,
    premium: approxPremium(market.spot, roundStrike(market.spot), 'call', days, iv),
    iv,
  });
}
