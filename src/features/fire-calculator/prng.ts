// Seedable PRNG used everywhere randomness is needed. Same algorithm as
// src/features/monte-carlo/engine.ts so test results are intuitively
// comparable across the two engines.

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller — only used for the rare "explicit Gaussian" code path. The
 *  default sampler is the block-bootstrap below, not this. */
export function boxMuller(rng: () => number): number {
  let u1 = rng();
  if (u1 === 0) u1 = 1e-12;
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Integer in [0, n). */
export function randInt(rng: () => number, n: number): number {
  return Math.floor(rng() * n);
}
