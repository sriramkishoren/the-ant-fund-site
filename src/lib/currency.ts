// Single source of truth for money formatting across the site.
//
// Two locales are supported. The important asymmetry is COMPACT formatting:
// the US groups by thousand/million/billion, India by thousand/lakh/crore.
// Rendering ₹3,00,00,000 as "₹30M" would be meaningless to an Indian reader,
// so each currency carries its own compaction ladder.
//
// Full (non-compact) formatting needs no special-casing — Intl already knows
// that en-IN groups digits as 1,50,00,000 rather than 15,000,000.

export type CurrencyCode = 'USD' | 'INR';

/** Rounded step sizes for numeric inputs, so ₹ fields don't nudge by $-sized amounts. */
export interface CurrencySteps {
  /** Portfolio / lump-sum fields. */
  large: number;
  /** Annual amounts, contributions. */
  medium: number;
  /** Monthly amounts. */
  small: number;
}

/** Locale vocabulary, so UI copy isn't hardcoded to one country's system. */
export interface CurrencyTerms {
  /** "dollars" / "rupees" — for phrases like "in today's dollars". */
  noun: string;
  /** Label for state/employer retirement income. */
  stateIncome: string;
  /** Short form of the above, for inline prose. */
  stateIncomeShort: string;
  /** Plain-language hint about which accounts are taxed on withdrawal. */
  taxHint: string;
}

export interface CurrencyMeta {
  code: CurrencyCode;
  /** BCP-47 tag driving Intl digit grouping. */
  locale: string;
  symbol: string;
  /** Full name, for the toggle's accessible label. */
  label: string;
  steps: CurrencySteps;
  terms: CurrencyTerms;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: {
    code: 'USD',
    locale: 'en-US',
    symbol: '$',
    label: 'US dollars',
    steps: { large: 10_000, medium: 1_000, small: 100 },
    terms: {
      noun: 'dollars',
      stateIncome: 'Social Security / pension',
      stateIncomeShort: 'Social Security',
      taxHint: 'Roth → use 0%. Mostly traditional/401(k) → try 15–22%.',
    },
  },
  INR: {
    code: 'INR',
    locale: 'en-IN',
    symbol: '₹',
    label: 'Indian rupees',
    steps: { large: 100_000, medium: 10_000, small: 5_000 },
    terms: {
      noun: 'rupees',
      stateIncome: 'EPF / NPS / pension',
      stateIncomeShort: 'EPF, NPS or pension',
      taxHint: 'PPF and EPF maturity is normally tax-free → use 0%. NPS and debt funds are taxed → try 10–20%.',
    },
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return v === 'USD' || v === 'INR';
}

export function currencyMeta(code: CurrencyCode): CurrencyMeta {
  return CURRENCIES[code];
}

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code].symbol;
}

// ── Full formatting ────────────────────────────────────────────────────────

const fullCache = new Map<string, Intl.NumberFormat>();

function fullFormatter(code: CurrencyCode, withCents: boolean): Intl.NumberFormat {
  const key = `${code}:${withCents}`;
  let f = fullCache.get(key);
  if (!f) {
    const meta = CURRENCIES[code];
    f = new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: meta.code,
      minimumFractionDigits: withCents ? 2 : 0,
      maximumFractionDigits: withCents ? 2 : 0,
    });
    fullCache.set(key, f);
  }
  return f;
}

/** $1,500,000 · ₹15,00,000 */
export function formatMoney(value: number, code: CurrencyCode, withCents = false): string {
  if (!Number.isFinite(value)) return '—';
  return fullFormatter(code, withCents).format(value);
}

// ── Compact formatting ─────────────────────────────────────────────────────

interface Tier {
  threshold: number;
  divisor: number;
  suffix: string;
}

// Ordered largest-first. USD: K / M / B. INR: K / L (lakh) / Cr (crore).
const TIERS: Record<CurrencyCode, Tier[]> = {
  USD: [
    { threshold: 1e9, divisor: 1e9, suffix: 'B' },
    { threshold: 1e6, divisor: 1e6, suffix: 'M' },
    { threshold: 1e3, divisor: 1e3, suffix: 'K' },
  ],
  INR: [
    { threshold: 1e7, divisor: 1e7, suffix: 'Cr' },
    { threshold: 1e5, divisor: 1e5, suffix: 'L' },
    { threshold: 1e3, divisor: 1e3, suffix: 'K' },
  ],
};

/**
 * Short form for chart axes and tight cards: $1.5M, $850K, ₹3Cr, ₹24L, ₹25K.
 * One decimal below 10 units, none at or above it, so widths stay predictable.
 */
export function formatMoneyCompact(value: number, code: CurrencyCode): string {
  if (!Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const symbol = CURRENCIES[code].symbol;

  const tiers = TIERS[code];
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (abs < tier.threshold) continue;

    const scaled = abs / tier.divisor;
    const digits = scaled < 10 ? 1 : 0;
    let rounded = Number(scaled.toFixed(digits));

    // Rounding can push a value up into the next tier: 9,999,999 rupees is
    // 99.99…L, which rounds to "100L" when it should read "1Cr" (and
    // $999,999 would read "$1000K" instead of "$1M"). If that happened and a
    // larger tier exists, render in that one instead.
    const bigger = tiers[i - 1];
    if (bigger && rounded * tier.divisor >= bigger.threshold) {
      const up = abs / bigger.divisor;
      const upDigits = up < 10 ? 1 : 0;
      rounded = Number(up.toFixed(upDigits));
      return `${sign}${symbol}${trimZero(rounded, upDigits)}${bigger.suffix}`;
    }

    return `${sign}${symbol}${trimZero(rounded, digits)}${tier.suffix}`;
  }
  return `${sign}${symbol}${Math.round(abs)}`;
}

function trimZero(n: number, digits: number): string {
  const s = n.toFixed(digits);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

// ── Non-money helpers (locale-aware, currency-independent) ─────────────────

const pctCache = new Map<string, Intl.NumberFormat>();

/** 4.0% — takes a fraction (0.04). */
export function formatPercent(value: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  const locale = CURRENCIES[code].locale;
  let f = pctCache.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    pctCache.set(locale, f);
  }
  return f.format(value);
}

/** Plain grouped number: 10,000 · 10,000 (en-IN groups larger values differently). */
export function formatNumber(value: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(CURRENCIES[code].locale).format(value);
}

// ── Grouped input formatting ───────────────────────────────────────────────
// Editable fields show grouped digits (1,000,000 / 10,00,000 / 1.000.000).
// Everything here is derived from Intl rather than hardcoded, so a locale whose
// grouping differs — India's 3-then-2s, or German's swapped separators — is
// handled without special cases, and adding a currency is a data-only change.

export interface GroupingStyle {
  /** Thousands/lakhs separator, e.g. "," or ".". */
  group: string;
  /** Decimal marker, e.g. "." or ",". */
  decimal: string;
  /** Size of the right-most digit group (3 essentially everywhere). */
  primary: number;
  /** Size of every group left of it (3 in en-US, 2 in en-IN). */
  secondary: number;
}

const groupingCache = new Map<CurrencyCode, GroupingStyle>();

export function groupingStyle(code: CurrencyCode): GroupingStyle {
  const cached = groupingCache.get(code);
  if (cached) return cached;

  const parts = new Intl.NumberFormat(CURRENCIES[code].locale).formatToParts(10_000_000.5);
  const sizes = parts.filter((p) => p.type === 'integer').map((p) => p.value.length);
  const style: GroupingStyle = {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    primary: sizes[sizes.length - 1] ?? 3,
    secondary: sizes.length >= 2 ? sizes[sizes.length - 2] : (sizes[sizes.length - 1] ?? 3),
  };
  groupingCache.set(code, style);
  return style;
}

function groupDigits(digits: string, s: GroupingStyle): string {
  if (digits.length <= s.primary) return digits;
  const head = digits.slice(0, digits.length - s.primary);
  const tail = digits.slice(digits.length - s.primary);
  const chunks: string[] = [];
  let i = head.length;
  while (i > s.secondary) {
    chunks.unshift(head.slice(i - s.secondary, i));
    i -= s.secondary;
  }
  if (i > 0) chunks.unshift(head.slice(0, i));
  chunks.push(tail);
  return chunks.join(s.group);
}

/**
 * Canonical raw string ("-1234.5") → grouped display string ("-1,234.5").
 * Preserves a trailing decimal marker and trailing zeros so the display doesn't
 * fight someone mid-way through typing "1.50".
 */
export function formatNumericDraft(raw: string, code: CurrencyCode): string {
  const s = groupingStyle(code);
  const negative = raw.startsWith('-');
  const body = negative ? raw.slice(1) : raw;

  const dot = body.indexOf('.');
  const rawInt = (dot === -1 ? body : body.slice(0, dot)).replace(/\D/g, '');
  const rawFrac = dot === -1 ? null : body.slice(dot + 1).replace(/\D/g, '');

  // Drop leading zeros ("050" → "50") but keep a lone "0".
  const intDigits = rawInt.replace(/^0+(?=\d)/, '');
  const grouped = intDigits === '' ? '' : groupDigits(intDigits, s);

  let out = (negative ? '-' : '') + grouped;
  if (rawFrac !== null) out += s.decimal + rawFrac;
  return out;
}

/**
 * Display string (grouped, any stray characters) → canonical raw string using
 * "." for the decimal point. Group separators are discarded; a leading "-" and
 * at most one decimal marker survive.
 */
export function parseNumericDraft(text: string, code: CurrencyCode): string {
  const s = groupingStyle(code);
  let out = '';
  let seenDecimal = false;
  for (const ch of text) {
    if (ch === '-' && out === '') {
      out += '-';
    } else if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (!seenDecimal && (ch === s.decimal || (ch === '.' && s.group !== '.'))) {
      out += '.';
      seenDecimal = true;
    }
    // anything else (group separators, spaces, letters) is dropped
  }
  return out;
}
