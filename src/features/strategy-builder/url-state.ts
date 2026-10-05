// Compact URL encoding so a position can be shared as a link, and saved to
// localStorage, without any account or server.
//
// Format:  v1|spot|rate|div|lot|ivMult|<leg>;<leg>;…
// Leg:     kind,action,qty,strike,days,premium,iv   (stock omits strike/days/iv)

import type { Leg, MarketInputs, Position } from './types';

const VERSION = 'v1';
export const URL_PARAM = 's';

const KIND_CODE = { call: 'c', put: 'p', stock: 's' } as const;
const CODE_KIND: Record<string, Leg['kind']> = { c: 'call', p: 'put', s: 'stock' };

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function encodePosition(position: Position): string {
  const m = position.market;
  const head = [VERSION, m.spot, m.rate, m.dividendYield, m.sharesPerContract, m.ivMultiplier].join('|');
  const legs = position.legs
    .map((l) =>
      [
        KIND_CODE[l.kind],
        l.action === 'buy' ? 'b' : 's',
        l.quantity,
        l.strike ?? '',
        l.daysToExpiry ?? '',
        l.premium,
        l.iv ?? '',
      ].join(','),
    )
    .join(';');
  return `${head}|${legs}`;
}

export function decodePosition(raw: string): Position | null {
  if (!raw) return null;
  const parts = raw.split('|');
  if (parts.length < 7 || parts[0] !== VERSION) return null;

  const market: MarketInputs = {
    spot: num(parts[1]),
    rate: num(parts[2]),
    dividendYield: num(parts[3]),
    sharesPerContract: num(parts[4]) || 100,
    ivMultiplier: num(parts[5]) || 1,
  };
  if (!(market.spot > 0)) return null;

  const legs: Leg[] = [];
  const legSource = parts.slice(6).join('|');
  for (const [i, chunk] of legSource.split(';').entries()) {
    if (!chunk.trim()) continue;
    const f = chunk.split(',');
    const kind = CODE_KIND[f[0]];
    if (!kind) return null;
    const quantity = num(f[2]);
    if (!(quantity > 0)) return null;

    legs.push({
      id: `leg-url-${i}`,
      kind,
      action: f[1] === 's' ? 'sell' : 'buy',
      quantity,
      strike: kind === 'stock' ? undefined : num(f[3]),
      daysToExpiry: kind === 'stock' ? undefined : num(f[4]),
      premium: num(f[5]),
      iv: kind === 'stock' ? undefined : num(f[6]),
    });
  }

  return legs.length > 0 ? { legs, market } : null;
}

/** Read a shared position off the current URL, if there is one. */
export function readPositionFromUrl(search: string): Position | null {
  try {
    const raw = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get(URL_PARAM);
    return raw ? decodePosition(raw) : null;
  } catch {
    return null;
  }
}
