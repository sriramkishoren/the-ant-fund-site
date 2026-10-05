import { describe, it, expect } from 'vitest';
import { decodePosition, encodePosition, readPositionFromUrl } from '../url-state';
import { analysePosition } from '../engine';
import { buildPreset, defaultMarket, PRESETS } from '../presets';

describe('position encoding round-trips', () => {
  it('survives a round trip for every preset, in both currencies', () => {
    for (const cur of ['USD', 'INR'] as const) {
      const market = defaultMarket(cur);
      for (const preset of PRESETS) {
        const original = buildPreset(preset.id, market);
        const back = decodePosition(encodePosition(original));
        expect(back, preset.id).not.toBeNull();
        expect(back!.market).toEqual(original.market);
        expect(back!.legs).toHaveLength(original.legs.length);
        original.legs.forEach((leg, i) => {
          const r = back!.legs[i];
          expect(r.kind).toBe(leg.kind);
          expect(r.action).toBe(leg.action);
          expect(r.quantity).toBe(leg.quantity);
          expect(r.strike ?? 0).toBeCloseTo(leg.strike ?? 0, 6);
          expect(r.premium).toBeCloseTo(leg.premium, 6);
        });
        // The decoded position must analyse to the same numbers.
        expect(analysePosition(back!).netCashflow).toBeCloseTo(
          analysePosition(original).netCashflow,
          6,
        );
      }
    }
  });

  it('keeps stock legs, which have no strike or expiry', () => {
    const p = buildPreset('covered-call', defaultMarket('USD'));
    const back = decodePosition(encodePosition(p))!;
    const stock = back.legs.find((l) => l.kind === 'stock')!;
    expect(stock.quantity).toBe(100);
    expect(stock.strike).toBeUndefined();
    expect(stock.daysToExpiry).toBeUndefined();
  });

  it('reads a position out of a query string', () => {
    const encoded = encodePosition(buildPreset('iron-condor', defaultMarket('USD')));
    expect(readPositionFromUrl(`?s=${encoded}`)!.legs).toHaveLength(4);
    expect(readPositionFromUrl('?other=1')).toBeNull();
    expect(readPositionFromUrl('')).toBeNull();
  });

  it('rejects junk rather than producing a broken position', () => {
    for (const bad of ['', 'nonsense', 'v9|1|2|3|4|5|c,b,1,1,1,1,1', 'v1|0|0|0|0|0|', 'v1|100|0|0|100|1|x,b,1,1,1,1,1']) {
      expect(decodePosition(bad)).toBeNull();
    }
  });
});
