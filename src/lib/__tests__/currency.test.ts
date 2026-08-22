import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  formatMoneyCompact,
  formatPercent,
  currencySymbol,
  isCurrencyCode,
} from '../currency';

describe('formatMoney — full', () => {
  it('formats USD with thousand grouping', () => {
    expect(formatMoney(1_500_000, 'USD')).toBe('$1,500,000');
    expect(formatMoney(5_000, 'USD')).toBe('$5,000');
  });

  it('formats INR with Indian lakh/crore digit grouping', () => {
    // The whole point: 30,000,000 groups as 3,00,00,000 — not 30,000,000.
    expect(formatMoney(30_000_000, 'INR')).toBe('₹3,00,00,000');
    expect(formatMoney(2_400_000, 'INR')).toBe('₹24,00,000');
    expect(formatMoney(150_000, 'INR')).toBe('₹1,50,000');
  });

  it('supports cents when asked', () => {
    expect(formatMoney(1234.5, 'USD', true)).toBe('$1,234.50');
  });

  it('handles non-finite input', () => {
    expect(formatMoney(NaN, 'USD')).toBe('—');
    expect(formatMoney(Infinity, 'INR')).toBe('—');
  });
});

describe('formatMoneyCompact — USD ladder (K/M/B)', () => {
  it('picks the right tier', () => {
    expect(formatMoneyCompact(2_400_000_000, 'USD')).toBe('$2.4B');
    expect(formatMoneyCompact(1_500_000, 'USD')).toBe('$1.5M');
    expect(formatMoneyCompact(30_000_000, 'USD')).toBe('$30M');
    expect(formatMoneyCompact(25_000, 'USD')).toBe('$25K');
    expect(formatMoneyCompact(500, 'USD')).toBe('$500');
  });

  it('drops a trailing .0', () => {
    expect(formatMoneyCompact(3_000_000, 'USD')).toBe('$3M');
  });

  it('promotes across a rounding boundary instead of emitting 1000K', () => {
    expect(formatMoneyCompact(999_999, 'USD')).toBe('$1M');
    expect(formatMoneyCompact(999_999_999, 'USD')).toBe('$1B');
  });

  it('signs negatives', () => {
    expect(formatMoneyCompact(-1_500_000, 'USD')).toBe('-$1.5M');
  });
});

describe('formatMoneyCompact — INR ladder (K/L/Cr)', () => {
  it('uses crore and lakh, never millions', () => {
    expect(formatMoneyCompact(30_000_000, 'INR')).toBe('₹3Cr');
    expect(formatMoneyCompact(24_000_000, 'INR')).toBe('₹2.4Cr');
    expect(formatMoneyCompact(2_400_000, 'INR')).toBe('₹24L');
    expect(formatMoneyCompact(150_000, 'INR')).toBe('₹1.5L');
    expect(formatMoneyCompact(25_000, 'INR')).toBe('₹25K');
    expect(formatMoneyCompact(500, 'INR')).toBe('₹500');
  });

  it('never emits an M suffix for rupees', () => {
    for (const v of [1e5, 1e6, 1e7, 1e8, 5e6, 12_345_678]) {
      expect(formatMoneyCompact(v, 'INR')).not.toContain('M');
    }
  });

  it('crosses the lakh and crore boundaries exactly', () => {
    // 99,999 rounds to 100K, which IS one lakh — so it promotes.
    expect(formatMoneyCompact(99_999, 'INR')).toBe('₹1L');
    expect(formatMoneyCompact(99_000, 'INR')).toBe('₹99K');
    expect(formatMoneyCompact(100_000, 'INR')).toBe('₹1L');
    // Rounding must promote rather than emit a nonsensical "100L".
    expect(formatMoneyCompact(9_999_999, 'INR')).toBe('₹1Cr');
    expect(formatMoneyCompact(10_000_000, 'INR')).toBe('₹1Cr');
  });
});

describe('misc helpers', () => {
  it('exposes symbols', () => {
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('INR')).toBe('₹');
  });

  it('formats percentages from fractions', () => {
    expect(formatPercent(0.04)).toBe('4.0%');
  });

  it('guards the code type', () => {
    expect(isCurrencyCode('INR')).toBe(true);
    expect(isCurrencyCode('EUR')).toBe(false);
    expect(isCurrencyCode(null)).toBe(false);
  });
});
