// Compact URL-state codec for the Beginner tier. Encodes the few fields a
// shareable Beginner link needs; later tiers extend this.

export interface BeginnerUrlState {
  spending: number;
  swr: number;
  /** Years until retirement; used to display the inflated nominal target. */
  yearsToRetirement: number;
  capeOverride?: number;
}

export function encodeBeginnerState(s: BeginnerUrlState): string {
  const params = new URLSearchParams();
  params.set('s', String(Math.round(s.spending)));
  params.set('swr', s.swr.toFixed(4));
  if (s.yearsToRetirement > 0) {
    params.set('y', String(Math.round(s.yearsToRetirement)));
  }
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
  const years = params.get('y');
  const cape = params.get('cape');
  if (s !== null) {
    const n = Number(s);
    if (Number.isFinite(n) && n >= 0) out.spending = n;
  }
  if (swr !== null) {
    const n = Number(swr);
    if (Number.isFinite(n) && n > 0 && n < 1) out.swr = n;
  }
  if (years !== null) {
    const n = Number(years);
    if (Number.isFinite(n) && n >= 0 && n <= 60) out.yearsToRetirement = n;
  }
  if (cape !== null) {
    const n = Number(cape);
    if (Number.isFinite(n) && n > 0) out.capeOverride = n;
  }
  return out;
}
