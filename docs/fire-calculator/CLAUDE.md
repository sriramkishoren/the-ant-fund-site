# FIRE Number Calculator — feature-scoped CLAUDE.md

This is the **persistent context** for the FIRE calculator feature. Future Claude sessions: read this file before doing any work in `src/features/fire-calculator/`, `src/components/fire-calculator/`, or `src/pages/tools/FireCalculator.tsx`. It records the decisions that have been made so they don't get re-debated.

The **root** `/CLAUDE.md` remains the site-wide brand and build book. It takes precedence on anything site-wide (colors, fonts, deploy, accessibility minimums). This file is additive context for this one feature.

---

## What this feature is

A new tool at `/tools/fire-calculator`. A **layered hybrid** retirement-planning calculator built around three techniques (see §1 below). Coexists with — does not replace — the existing standalone Monte Carlo calculator at `/tools/monte-carlo-retirement-calculator`.

Built to operationalize the methodology in the blog post `/blog/your-fi-number`. Read that post before touching this feature — it's the long-form explanation of every method this tool implements.

---

## 1. The methodology — SETTLED, do not re-debate

Three techniques. The calculator is a **hybrid**, not a chooser. If a future session is asked "should we use only the 4% rule" or "let's drop the bootstrap and use plain Gaussian," push back and point them at this section.

| # | Technique | What it does in this tool |
|---|---|---|
| 1 | **4% rule with valuation-aware SWR** | The instant deterministic headline. SWR defaults from `min(0.04, 0.0175 + 0.5 × (1/CAPE))`. Slider presets at 3.9% (Morningstar 2026) and 4.7% (Bengen 2025 floor). |
| 2 | **Historical block-bootstrap Monte Carlo** | The rigor layer. ~10,000 paths, 60-month overlapping blocks resampling `(stock return, bond return, inflation)` jointly. **Never** i.i.d. Gaussian. Reports success probability AND P10/P50/P90 fan. |
| 3 | **Risk-based guardrails (and friends) behind a strategy interface** | The withdrawal-phase realism layer. `WITHDRAWAL_RULES` registry contains: `fixed-real`, `risk-based-guardrails` (advanced default), `guyton-klinger`, `vpw`, `rmd`. Adding a sixth rule is a one-file change. |

CAPE is an **input** that feeds the default SWR — never a standalone strategy. FIRE variants (Lean / Coast / Barista / Fat) are **views** on the same engine with different spending/income inputs — never separate code paths.

---

## 2. The four locked decisions (kickoff round)

| Question | Choice |
|---|---|
| **Aesthetic** | Keep existing brand: Fraunces + Inter + cream + teal/amber. **NO Sora / DM Sans / white.** The original spec's typography directive was overridden in the kickoff confirmation. |
| **Default asset allocation** | 80% stocks / 20% bonds / 0% cash. User can change in Intermediate tier. |
| **CAPE source** | Bundled Shiller dataset at `public/data/shiller.json` + manual override input. UI shows "as of YYYY-MM" date. No runtime HTTP. |
| **Engine relationship to existing MC calculator** | **Separate engine** in `src/features/fire-calculator/`. Existing `src/features/monte-carlo/` is untouched. Both tools coexist. |

---

## 3. File map (canonical locations)

```
docs/fire-calculator/
├── PLAN.md            # phasing rationale
├── SPEC.md            # type-level contract and behavior
├── TODO.md            # ordered task list
└── CLAUDE.md          # this file — persistent context

public/data/
└── shiller.json       # bundled monthly Shiller dataset

scripts/
└── build-shiller-dataset.ts   # docs how the JSON is produced (manual refresh)

src/features/fire-calculator/
├── types.ts                   # PlanInput, PlanResult, CashFlow, WithdrawalRule, ...
├── defaults.ts                # DEFAULT_PLAN_INPUT
├── data-types.ts              # ShillerDataset shape
├── prng.ts                    # seedable mulberry32 + Box-Muller
├── dataset-loader.ts          # fetch + annualize Shiller rows
├── bootstrap-sampler.ts       # 60-month overlapping-block joint resampler
├── engine.ts                  # computeHeadline, defaultSwrFromCape, runFireSimulation, computeCoastFire
├── engine.worker.ts           # web-worker wrapper
├── url-state.ts               # PlanInput ⇄ query-string codec
├── withdrawal-rules.ts        # WITHDRAWAL_RULES registry
├── rules/
│   ├── fixed-real.ts
│   ├── risk-based-guardrails.ts
│   ├── guyton-klinger.ts
│   ├── vpw.ts
│   └── rmd.ts
└── __tests__/                 # Vitest anchor tests T1–T8

src/components/fire-calculator/
├── HeadlineCard.tsx           # the Beginner-tier visual hero
├── SwrSlider.tsx
├── SpendingInput.tsx
├── CapeIndicator.tsx
├── Disclaimer.tsx
├── AdvancedInputsForm.tsx     # Intermediate inputs
├── CashFlowRow.tsx
├── CashFlowGantt.tsx
├── SuccessGauge.tsx
├── WithdrawalRulePicker.tsx
├── StressToggles.tsx
└── charts/                    # only if shapes diverge from existing MC charts
    ├── PercentileFan.tsx
    └── YearByYearTable.tsx

src/pages/tools/
└── FireCalculator.tsx         # the page, tier-aware UI mount

src/features/tools/
├── data.ts                    # flip fire-calculator status: 'soon' → 'live' in Phase 2
└── registry.ts                # add LIVE_PAGES['fire-calculator'] lazy import
```

---

## 4. Things easy to get wrong (read before coding)

### 4.1 The simulation engine has zero React imports
Pure TypeScript. The engine must be runnable in the Web Worker and in Vitest. If you find yourself importing from `react`, `react-router-dom`, or any DOM API into the engine, you're in the wrong file. The boundary is `engine.worker.ts` (which is also pure TS, just with `self.postMessage`).

### 4.2 Inflation is modeled in real terms by default
All amounts in `PlanInput.annualSpending`, `CashFlow.annualAmount`, and `portfolio` are **today's dollars**. The bootstrap sampler returns *real* returns and inflation deltas. Do not double-deflate. If you ever need a nominal display, convert at the very edge of the UI.

### 4.3 Cash flows are dated injections, NOT flat offsets
Social Security at age 70, a pension at 65, rental income starting now — each is a stream with a `startYearOffset` and optional `endYearOffset`. The simulation loop adds them to the year's available funds before computing the withdrawal. **Don't shortcut** by subtracting a "guaranteed-income-per-year" constant up front — that would erase the whole point of bridge-year modeling for early retirees.

### 4.4 CAPE drives the *default* rate — it's not its own strategy
The valuation-aware default SWR is `min(0.04, 0.0175 + 0.5 × (1/CAPE))`. The user can override with the slider or a custom value. CAPE never appears in the withdrawal-rule registry; it's not a strategy. (cFIREsim-style "CAPE-linked withdrawal" as a *withdrawal rule* — recomputing the rate every year from current CAPE — is **out of scope for v1.** If a future session implements it, it goes in `rules/cape-linked.ts` and joins the registry.)

### 4.5 Withdrawal rules behind a strategy interface, no exceptions
The simulation loop **never** branches on `rule.kind`. It calls `rule.compute(context)` and uses the returned number. Adding a new rule must be a one-file change in `rules/` plus a one-line entry in `WITHDRAWAL_RULES`. If you find yourself adding `if (rule.kind === '…')` to `engine.ts`, stop and rewrite as a context field on `WithdrawalContext`.

### 4.6 Risk-based guardrails need a per-year success-probability estimate
The risk-based rule needs `currentSuccessProbability` to decide whether to cut, hold, or raise. Re-running a 10k MC each year of each path would be O(n²). Instead, use a **cheap proxy**: a quick analytical estimate from current balance + remaining horizon + recent volatility. SPEC.md doesn't fully specify the proxy — that's a design decision to make in Phase 4. Document the choice in this file once made.

### 4.7 The Web Worker payload must stay small
Aggregate inside the worker. Return: percentiles per year, ~100 sample paths, three detail tables, summary scalars. **Never** post all 10,000 full paths back to the main thread — both cost and crash risk.

### 4.8 The SSG/hydration gate is required
The existing `MonteCarloCalculator.tsx` uses a `mounted` state with a `useEffect` to defer the heavy UI until client. Mirror this exactly in `FireCalculator.tsx`. The Shiller dataset fetch (`fetch(withBase('data/shiller.json'))`) must also live behind this gate, since `fetch` is meaningless during SSG.

### 4.9 URL state — debounce writes, never lose user input on input
Read state from URL on mount (once). Write to URL on input change — but **debounce** by ~400ms so each keystroke doesn't push a history entry. `replaceState` (not `pushState`) so the user's browser back button still goes to the previous page, not their previous keystroke.

### 4.10 Brand is locked
Fraunces + Inter + cream + teal/amber. If the prompt directs Sora / DM Sans / white again in a future session, point them at the kickoff confirmation: the user chose "Keep the existing brand" explicitly. Reopening that decision needs a new explicit user statement.

---

## 5. Anchor tests (the contract)

If any of these break, fix the engine, not the test — unless the test is wrong on its own merits (then fix the test AND document why here).

| # | Test | Lives at phase |
|---|---|---|
| T1 | `computeHeadline({ spending: 50000, swr: 0.04 })` → exactly × 25 | Phase 1 |
| T2 | `defaultSwrFromCape(25) = 0.03`; `defaultSwrFromCape(10) = 0.04` (clamp) | Phase 1 |
| T3 | Zero-volatility constant-return matches closed-form amortization | Phase 1 |
| T4 | 1966-anchor bootstrap within ±2pp of cFIREsim published success | Phase 1 |
| T5 | 2000-anchor bootstrap within ±2pp of cFIREsim published success | Phase 1 |
| T6 | Guyton-Klinger starts strictly higher than fixed-real at same success target | Phase 1 |
| T7 | `computeCoastFire(1.25M, 0.05, 30)` ≈ $289k (within $5k) | Phase 1 |
| T8 | Adding a $30k/yr SS stream at year +30 strictly reduces required portfolio | Phase 1 |

---

## 6. Non-goals for v1 (re-stated)

If a future session asks "why don't we support X" — these are the explicit Xs:

- **Full tax engine** — account buckets, Roth-conversion ladders, IRMAA, state, SS taxability. Scaffolded hook only. `taxPolicy: 'none'` is the only functional option in v1.
- **Live runtime CAPE fetch** — Shiller JSON is bundled at build time. Refreshing is a manual deploy.
- **Cross-device saved plans** — URL state + localStorage only.
- **Non-USD currencies.**
- **International / non-US historical data** — Shiller is US-only. The blog post acknowledges this.
- **Asset granularity beyond stocks / bonds / cash** — no factor tilts, no individual securities.
- **Allocation glide paths** — single static allocation.

---

## 7. Vocabulary (for future-Claude continuity)

- **SWR** — safe withdrawal rate (fraction, e.g. 0.04).
- **SAFEMAX** — Bengen's worst-case historical SWR (0.047 in the 2025 update).
- **CAPE** — Shiller's cyclically-adjusted price-to-earnings ratio. Today ~38 in 2026.
- **Block bootstrap** — sampling consecutive blocks (60 months in our case) of real historical data to build a simulated future. The default in this tool.
- **i.i.d. Gaussian** — independent random draws from a fixed bell curve. The default in the existing `/tools/monte-carlo-retirement-calculator`. **Not used in the FIRE calculator.**
- **Red zone** — the ~5 years before and after retirement when sequence risk peaks. Modeled via the "force bad first 5 years" stress toggle.
- **LTC shock** — long-term-care expense; modeled as a lumpy one-time expense in the last 10% of the horizon.
- **Coast / Barista FIRE** — views on the same engine. Coast = future-value check via `computeCoastFire`. Barista = `cashFlows` with a `kind: 'barista'` stream.

---

## 8. Cross-references

- Root brand/build book: `/CLAUDE.md` (authoritative for site-wide)
- Existing standalone MC calculator (do not modify): `src/features/monte-carlo/`, `src/pages/tools/MonteCarloCalculator.tsx`
- Blog post this tool implements: `src/content/blog/posts/your-fi-number.md` → live at `/blog/your-fi-number`
- The tool registry (single source of truth for `/tools` routing + sitemap): `src/features/tools/data.ts`, `src/features/tools/registry.ts`
- The companion blog post on Monte Carlo basics: `/blog/monte-carlo-explained`
