// Compact URL-state codec for the Beginner tier. Encodes the few fields a
// shareable Beginner link needs; later tiers extend this.

export interface BeginnerUrlState {
  spending: number;
  swr: number;
  capeOverride?: number;
}

export function encodeBeginnerState(s: BeginnerUrlState): string {
  const params = new URLSearchParams();
  params.set('s', String(Math.round(s.spending)));
  params.set('swr', s.swr.toFixed(4));
  if (s.capeOverride !== undefined) {
    params.set('cape', s.capeOverride.toFixed(2));
  }
  return params.toString();
}

export function decodeBeginnerState(search: string): Partial<BeginnerUrlState> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: Partial<BeginnerUrlState> = {};
  const s = params.get('s');
  const swr = params.get('swr');
  const cape = params.get('cape');
  if (s !== null) {
    const n = Number(s);
    if (Number.isFinite(n) && n >= 0) out.spending = n;
  }
  if (swr !== null) {
    const n = Number(swr);
    if (Number.isFinite(n) && n > 0 && n < 1) out.swr = n;
  }
  if (cape !== null) {
    const n = Number(cape);
    if (Number.isFinite(n) && n > 0) out.capeOverride = n;
  }
  return out;
}
