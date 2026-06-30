# FIRE Number Calculator — SPEC

The precise contract. PLAN.md says how we get there in phases; this document says exactly **what** we're building. If something is ambiguous below, fix this file first, then code.

## 1. Methodology recap (settled — do not re-debate)

Three techniques, each answering a different question. The calculator is a **hybrid**, not a chooser.

| # | Technique | Answers |
|---|---|---|
| 1 | **4% rule with valuation-aware SWR** | "What's my goal number?" — the instant headline. |
| 2 | **Historical block-bootstrap Monte Carlo** | "How likely is this plan to survive?" — rigor and probability. |
| 3 | **Risk-based guardrails (and friends) behind a strategy interface** | "What spending rule should I follow?" — withdrawal-phase realism. |

CAPE is an **input** that feeds the default SWR in (1) and (2). FIRE variants (Lean / Coast / Barista / Fat) are **views** on the same engine with different spending or income inputs — never separate code paths. Inflation is modeled in **real terms** by default. Income sources are **dated cash-flow injections**, never flat offsets.

## 2. Engine API

### 2.1 Types

```ts
// src/features/fire-calculator/types.ts

export interface Allocation {
  stocks: number; // 0..1 (e.g. 0.8 = 80%)
  bonds: number;
  cash: number;   // residual; stocks + bonds + cash should sum to 1.0
}

export interface CashFlow {
  /** "social-security" | "pension" | "rental" | "barista" | "lump-sum" | "other" */
  kind: CashFlowKind;
  /** Display label shown in UI / charts. */
  label: string;
  /** Year offset from today (0 = this year). */
  startYearOffset: number;
  /** Year offset from today the stream ends. Omit for lifetime. */
  endYearOffset?: number;
  /** Real dollars per year in start year. */
  annualAmount: number;
  /** "cpi" = inflation-linked, "fixed" = nominal flat, "fraction" = partial COLA. */
  colaMode: 'cpi' | 'fixed' | 'fraction';
  /** Used when colaMode === 'fraction' (e.g. 0.5 for 50% of CPI). */
  colaFraction?: number;
  /** Reserved for v2 tax engine. Default false. */
  taxable?: boolean;
}

export type WithdrawalRuleKind =
  | 'fixed-real'
  | 'risk-based-guardrails'
  | 'guyton-klinger'
  | 'vpw'
  | 'rmd';

export interface WithdrawalRule {
  kind: WithdrawalRuleKind;
  /** Initial withdrawal rate as a fraction (e.g. 0.04). */
  initialRate: number;
  /** Rule-specific knobs (rails width, guardrail thresholds, RMD ages, etc.). */
  params?: Record<string, number>;
}

export interface PlanInput {
  portfolio: number;             // current invested assets, today's dollars
  annualSpending: number;        // desired real spending in retirement, today's dollars
  currentAge: number;
  retirementAge: number;
  horizonYears: number;          // simulation length from retirement (default: lifeExpectancy - retirementAge)
  allocation: Allocation;
  withdrawalRule: WithdrawalRule;
  cashFlows: CashFlow[];
  successThreshold: number;      // 0..1, default 0.9
  capeOverride?: number;         // user override; otherwise computed from bundled data
  numSims: number;               // default 10_000
  seed?: number;                 // for reproducibility in tests
  /** Stress-test toggles. */
  stress?: {
    forceBadFirstYears?: boolean;  // "retirement red zone"
    longTermCareShock?: boolean;   // pulls safe rate ~0.4pp lower
  };
  /** Reserved for v2. Always 'none' in v1. */
  taxPolicy?: 'none' | 'simple-blended';
}

export interface PlanResult {
  /** Deterministic headline number — `spending / SWR` at the chosen rate. */
  fireNumber: number;
  /** SWR actually used to compute fireNumber. */
  usedSwr: number;
  /** "× 25" style multiple. */
  multiple: number;

  /** Probability of finishing the horizon with portfolio > 0. */
  successProbability: number;

  /** Per-year P10/P25/P50/P75/P90 portfolio values across all simulations. */
  percentiles: YearlyPercentile[];

  /** ~100 sample paths for the chart overlay. */
  samplePaths: number[][];

  /** Median, p10, p90 year-by-year detail rows for the table. */
  detailPaths: {
    median: YearlyDetailRow[];
    p10: YearlyDetailRow[];
    p90: YearlyDetailRow[];
  };

  /** Run metadata. */
  meta: {
    runs: number;
    seed: number;
    capeUsed: number;
    capeAsOf: string;            // ISO date from the bundled dataset
    withdrawalRule: WithdrawalRuleKind;
    horizonYears: number;
    blockSize: number;           // historical block-bootstrap block length
  };
}
```

(`YearlyPercentile` and `YearlyDetailRow` mirror the existing shapes in `src/features/monte-carlo/types.ts` so charts and tables can be reused without duplication.)

### 2.2 Public functions

```ts
// src/features/fire-calculator/engine.ts

/** Instant deterministic headline number. Pure, synchronous. */
export function computeHeadline(args: {
  annualSpending: number;
  swr: number;
}): { fireNumber: number; multiple: number };

/** Default SWR from CAPE: min(0.04, 0.0175 + 0.5 * (1/CAPE)). */
export function defaultSwrFromCape(cape: number): number;

/** Full simulation. ~10k runs. Heavy — call from the Web Worker. */
export function runFireSimulation(
  input: PlanInput,
  opts?: { onProgress?: (completed: number, total: number) => void },
): PlanResult;

/** Coast FIRE future-value check — independent helper, not part of the sim. */
export function computeCoastFire(args: {
  fullFireNumber: number;
  realReturn: number;
  yearsToTraditionalRetirement: number;
}): number;
```

### 2.3 Withdrawal-rule strategy interface

```ts
// src/features/fire-calculator/withdrawal-rules.ts

export interface WithdrawalContext {
  yearIndex: number;             // 0-based, since retirement
  age: number;
  portfolioValue: number;
  inflationToDate: number;       // cumulative factor since year 0
  initialRate: number;
  cashFlowsThisYear: number;     // already injected separately
  remainingHorizonYears: number;
  /** Used by risk-based-guardrails: most recent success probability. */
  currentSuccessProbability?: number;
}

export type WithdrawalFn = (ctx: WithdrawalContext) => number;

export interface WithdrawalRuleImpl {
  kind: WithdrawalRuleKind;
  /** Returns withdrawal amount in nominal dollars for this year. */
  compute: WithdrawalFn;
  /** Display name for UI dropdowns. */
  displayName: string;
}

export const WITHDRAWAL_RULES: Record<WithdrawalRuleKind, WithdrawalRuleImpl>;
```

Each rule is a single file under `src/features/fire-calculator/rules/`. Adding a sixth rule is a one-file change plus a one-line entry in the `WITHDRAWAL_RULES` map.

## 3. Defaults

Sensible defaults so the Beginner tier shows something useful on first load with **zero inputs** required.

| Field | Default | Notes |
|---|---|---|
| `currentAge` | 35 | Median FIRE-blog reader |
| `retirementAge` | 50 | Early-retirement framing |
| `lifeExpectancy` (used to derive horizon) | 95 | Conservative for FIRE planning |
| `horizonYears` | `lifeExpectancy − retirementAge` = 45 | Long horizon by default |
| `portfolio` | $100,000 | Round, plausible |
| `annualSpending` | $50,000 | Maps to the worked example in the blog post |
| `allocation` | 80 / 20 / 0 (stocks / bonds / cash) | **Locked decision** |
| `withdrawalRule.kind` | `'fixed-real'` | Beginner + Intermediate default |
| `withdrawalRule.initialRate` | `defaultSwrFromCape(currentCape)` clamped to ≤ 0.04 | The valuation-aware default; presets show 3.9% and 4.7% |
| `cashFlows` | `[]` | None by default; user adds Social Security etc. in Intermediate |
| `successThreshold` | 0.9 | 90% target |
| `numSims` | 10,000 | Heavy, runs in worker |
| `stress` | both `false` | Off by default |
| `taxPolicy` | `'none'` | v1 |

### 3.1 Rate slider preset values

| Preset | Value | Source / label |
|---|---|---|
| **Conservative (Morningstar 2026)** | 3.9% | Forward-looking fixed SWR, 90% success target |
| **Valuation-aware (default)** | `defaultSwrFromCape(cape)` clamped to ≤ 4% | Live from bundled Shiller CAPE |
| **Bengen 2025 floor** | 4.7% | Updated SAFEMAX |

User can also type any custom rate in the input.

## 4. Data — Shiller dataset

### 4.1 File location & shape

```
public/data/shiller.json
```

Shape:

```ts
// src/features/fire-calculator/data-types.ts

export interface ShillerMonthlyRow {
  date: string;            // ISO yyyy-mm (e.g. "2026-05")
  sp500RealReturnPct: number;  // total return, already converted to real
  bondRealReturnPct: number;
  cpi: number;
  cape: number;
}

export interface ShillerDataset {
  asOf: string;            // ISO date of last row
  rows: ShillerMonthlyRow[];
  /** Source attribution + version. */
  meta: {
    source: 'shiller-online';
    sourceUrl: string;
    generatedAt: string;
    generatorScript: 'scripts/build-shiller-dataset.ts';
  };
}
```

### 4.2 Generation

A Node script `scripts/build-shiller-dataset.ts` documents how to regenerate the JSON from Robert Shiller's published Excel file. The script is **not** run on every build (no network dependency); the JSON is committed to the repo and regenerated manually when refreshed. The PLAN treats this as Phase 0 setup.

### 4.3 Loading

The dataset is fetched once at calculator mount with a relative `withBase('data/shiller.json')` URL. Cache forever via the immutable hashed asset path. Total size ~150 KB; lives inside the lazy-loaded calculator chunk.

### 4.4 Block-bootstrap

- **Block size:** 60 months (5 years), overlapping windows.
- **Joint resampling:** each block carries (stock return, bond return, inflation) together — preserves real-world correlation.
- **Annual aggregation:** monthly returns within a 12-month window compound into a single annual figure before being applied to the portfolio.
- **Wrap:** if a draw would run off the end of the dataset, wrap to the beginning (cheap and standard).

## 5. UI tiers — progressive disclosure

One page, three disclosure levels. The user's tier persists in URL state so a shared link reopens at the same level.

### 5.1 Beginner (default landing)

**What's shown:**
- Spending input (`$/year`).
- SWR slider with the three presets (3.9% / valuation-aware / 4.7%).
- A live CAPE indicator: `"CAPE today: 38.2 (as of 2026-05) — implies SWR 2.4%"` with the option to override.
- **The headline:** giant `FIRE number ≈ $1,250,000` with `× 25.0` underneath.
- Persistent disclaimer.
- A "Show me the simulation" link that switches to Intermediate.

**What's NOT shown:**
- No Monte Carlo, no charts, no withdrawal-rule picker, no cash flows.

The deterministic calculation is synchronous and instant — no worker, no spinner.

### 5.2 Intermediate

**Adds:**
- Current age, retirement age, life expectancy → horizon derived.
- Allocation slider (stocks vs bonds; cash defaults to 0).
- Cash flows: an "Add income source" panel for Social Security, pension. Each entry has start year, real annual amount, CPI/fixed/fraction COLA selector.
- **Success probability gauge** (0–100% with a colored band: red < 70, amber 70–90, teal ≥ 90).
- **P10/P50/P90 percentile fan** of portfolio value over the horizon.
- Withdrawal rule is **fixed-real** at this tier (the rule picker is Advanced-only).

The worker runs the 10k-sim block-bootstrap with a progress bar.

### 5.3 Advanced

**Adds:**
- **Withdrawal-rule picker:** Fixed-real → Risk-based guardrails (advanced default) → Guyton-Klinger → VPW → RMD. Each option carries a one-line description.
- Multi-source income with full COLA + taxability flags + per-source labels.
- **Stress tests:**
  - "Force a bad first 5 years" (retirement red zone) — replaces the first 5 sampled blocks with historically-bad blocks (1929–1933, 1973–1977).
  - "Long-term-care shock" — appends a one-time lumpy expense in the last 10% of the horizon; lowers the safe rate ~0.4 percentage points in published research.
- **Year-by-year table** (paginated, median / p10 / p90 toggles — same component as the existing MC calculator).
- **Tax policy selector** — exposed as `'none'` (default, v1) and `'simple-blended'` (placeholder coming-soon).

## 6. URL state & persistence

State persisted as a compact query string:

```
/tools/fire-calculator?s=50000&p=100000&a=35&r=50&h=45&alloc=80-20&swr=0.04&rule=fixed-real&tier=beginner
```

Cash flows encoded as a packed sub-string:

```
&cf=SS:67:30000:cpi,PEN:65:18000:fixed
```

A "Copy link" button emits the current URL. Deep links re-hydrate state on load. `localStorage` is a secondary persistence layer for the last-used inputs (so users returning without a link don't lose their work).

## 7. Charts & visuals

All charts use **Recharts**, matched to the existing MC calculator for visual consistency. Reuse `TrajectoryChart` and `OutcomeHistogram` from `src/components/calculator/charts/` where possible — if the shapes diverge, fork into `src/components/fire-calculator/charts/`.

- **Success gauge** — a semi-circular gauge from 0–100% with the three-zone color band; the needle lands on the computed success probability.
- **Percentile fan** — area chart with P10–P90 band, P25–P75 inner band, P50 line, retirement-age reference line. Already implemented in `TrajectoryChart`.
- **Cash-flow Gantt** — a horizontal strip showing each cash-flow's active years on a timeline aligned with the simulation horizon. Helps the user spot a missing bridge year.

All charts respect `prefers-reduced-motion`; no chart animates on first render.

## 8. Routing & registry

- Route: `/tools/fire-calculator` — already declared in `src/features/tools/data.ts` as `'soon'`. Flip to `'live'` in Phase 2 and add a `LIVE_PAGES['fire-calculator']` entry pointing to a `lazy(() => import('@/pages/tools/FireCalculator'))`.
- Page component: `src/pages/tools/FireCalculator.tsx` — top-level page with the SEO tags, breadcrumb (`Tools / FIRE Calculator`), and the tier-aware UI mount.
- Sitemap regenerates automatically because `scripts/load-tools.ts` reads from `data.ts`.

## 9. Testing — anchor assertions

Tests live in `src/features/fire-calculator/__tests__/`. Pure-engine tests use a seeded RNG so runs are reproducible.

| # | Test | Acceptance |
|---|---|---|
| T1 | `computeHeadline({ annualSpending: 50000, swr: 0.04 })` returns `{ fireNumber: 1_250_000, multiple: 25 }` | Exact equality |
| T2 | `defaultSwrFromCape(25) === 0.03`; `defaultSwrFromCape(10) === 0.04` (clamp at 4%) | Exact |
| T3 | `runFireSimulation` with `zero-volatility` synthetic dataset (constant 5% real, zero σ) matches the closed-form amortization for a fixed-real rule | Within 0.5% rounding |
| T4 | Historical bootstrap with a **1966 start anchor** + fixed-real 4% lands within ±2 percentage-points of cFIREsim's published success rate for the same inputs | Within 2pp |
| T5 | Same for **2000 start anchor** | Within 2pp |
| T6 | Withdrawal-rule strategy: swap from `fixed-real` to `guyton-klinger` produces a measurably higher starting rate at the same success target | Strictly greater |
| T7 | Coast FIRE helper: `computeCoastFire({ fullFireNumber: 1_250_000, realReturn: 0.05, yearsToTraditionalRetirement: 30 })` ≈ `$289,000` | Within $5,000 |
| T8 | Cash-flow injection: adding a $30k/yr Social Security stream at year +30 reduces the required portfolio meaningfully vs no-cashflow baseline | Strictly less |

If a test breaks because the engine produced a *more accurate* number, fix the test, not the engine — and note it in CLAUDE.md.

## 10. Performance & accessibility

- 10k runs × ~45 years complete in **under 2 seconds** in a Web Worker on a 2020 laptop. If they don't, look at hot-path allocations (use `Float64Array`s, avoid re-creating sampler closures).
- Worker payload returned to the main thread is **small** — aggregated percentiles + ~100 sample paths + 3 detail tables. **Never** post all 10k full paths back.
- All form controls have `<label>`s, all icons have `aria-label`s, the success gauge has a `role="img"` with an accessible name like `"Success probability 85 percent"`.
- Keyboard tab order matches visual order; focus rings use the existing teal focus-visible outline.
- Mobile: Beginner tier is fully usable at 320px. Intermediate / Advanced charts collapse gracefully.

## 11. Acceptance criteria for v1

The Phase-2 ship is "v1" — a working Beginner tier in production. Subsequent phases are extensions.

A merge to `main` is shippable when:

1. `npm run typecheck` and `npm run lint` pass with zero warnings.
2. `npm run build` succeeds; `/tools/fire-calculator/index.html` is in `dist/`.
3. Anchor tests T1, T2, T7 pass (Beginner-tier scope).
4. Direct visit to `https://theantfund.com/tools/fire-calculator` renders the Beginner UI with the headline number visible within 500ms of hydration.
5. The `/tools` landing page shows the FIRE calculator as **Available now**.
6. The home page tile grid shows it as well (FeaturedTools reads from the same registry).
7. The persistent disclaimer is visible on the calculator page.

Phases 3 / 4 / 5 add to this list incrementally (anchor tests T3–T8, charts, advanced rules, stress tests).

## 12. Non-goals for v1 (consolidated)

Repeated from PLAN.md §5 for completeness in this doc:

- Full tax engine (account buckets / Roth ladders / IRMAA / state taxes / SS taxability)
- Live runtime CAPE fetch
- Cross-device saved plans
- Non-USD currencies
- International / non-US historical data
- Asset-class granularity beyond stocks / bonds / cash
- Allocation glide paths
