# FIRE Number Calculator — TODO

Ordered, checkable. Each phase ends with a real, shippable artifact. Tick off in order; do not jump ahead.

The phase numbering matches PLAN.md §4. SPEC.md is the contract behind every item.

---

## Phase 0 — Data & scaffolding

*Goal: everything we need to start coding lives in the repo. No user-visible change yet.*

- [ ] Add `public/data/shiller.json` with the bundled monthly Shiller dataset (S&P real return, bond real return, CPI, CAPE; ~1871-present).
- [ ] Add `scripts/build-shiller-dataset.ts` documenting how the JSON is produced from Shiller's published Excel file. (Manual process — not run on every build.)
- [ ] Add `src/features/fire-calculator/` directory with empty `types.ts`, `engine.ts`, `defaults.ts`, `rules/` subfolder, `__tests__/` subfolder. Empty index files OK.
- [ ] Add `src/pages/tools/FireCalculator.tsx` stub that returns a one-line "Coming soon" placeholder. **Don't wire it into the registry yet.**
- [ ] Confirm `npm run typecheck`, `npm run lint`, `npm run build` still green.
- [ ] Commit: `chore(fire): scaffold data + folder structure for FIRE calculator`.

**Done when:** new files exist, build is green, nothing is user-visible.

---

## Phase 1 — Pure engine + tests

*Goal: a complete, framework-free engine in `src/features/fire-calculator/` with anchor tests passing. Still no UI.*

### 1.1 Types & defaults

- [ ] `types.ts` — `Allocation`, `CashFlow`, `WithdrawalRule`, `WithdrawalRuleKind`, `PlanInput`, `PlanResult`, `YearlyPercentile`, `YearlyDetailRow` (reuse / mirror existing MC types where shapes line up).
- [ ] `defaults.ts` — `DEFAULT_PLAN_INPUT` matching SPEC.md §3.
- [ ] `data-types.ts` — `ShillerMonthlyRow`, `ShillerDataset`.

### 1.2 Sampling

- [ ] `prng.ts` — seedable mulberry32; Box-Muller helper (not used in bootstrap, but available for any explicitly-Gaussian needs).
- [ ] `dataset-loader.ts` — pure function that takes a `ShillerDataset` and returns annualized rows ready to sample (12-month compounding window).
- [ ] `bootstrap-sampler.ts` — block-bootstrap with **60-month overlapping blocks**, joint resampling of `(stockRealReturn, bondRealReturn, inflation)`. Wraps at end of dataset.

### 1.3 Withdrawal rules

- [ ] `rules/fixed-real.ts` — inflation-adjusted constant.
- [ ] `rules/risk-based-guardrails.ts` — recomputes a quick success-probability estimate; adjusts spending when it drifts < 80% or > 99%.
- [ ] `rules/guyton-klinger.ts` — capital-preservation rule (cut 10% above +20% rail), prosperity rule (raise 10% below -20% rail), inflation skip after down years.
- [ ] `rules/vpw.ts` — age-rising percentage from a small lookup table.
- [ ] `rules/rmd.ts` — divide by remaining life expectancy.
- [ ] `withdrawal-rules.ts` — `WITHDRAWAL_RULES` registry mapping kind → impl; exported `getRule(kind)`.

### 1.4 Simulation loop

- [ ] `engine.ts` — `runFireSimulation(input, opts)`:
  - Pre-allocate `Float64Array` for all paths.
  - For each of 10,000 sims: build a sampled return/inflation sequence; loop year-by-year applying allocation-weighted return, cash flows, and the chosen withdrawal rule; record terminal balance and survival.
  - Aggregate per-year percentiles; pick ~100 sample paths for overlay; build median/p10/p90 detail tables.
  - Emit progress every N runs via `opts.onProgress`.
- [ ] `engine.ts` — `computeHeadline({ annualSpending, swr })` and `defaultSwrFromCape(cape)` (clamped to ≤ 4%).
- [ ] `engine.ts` — `computeCoastFire({ fullFireNumber, realReturn, yearsToTraditionalRetirement })`.

### 1.5 Tests

- [ ] Set up Vitest (if not already configured). Add `npm run test` script.
- [ ] T1: `computeHeadline` → exact × 25 at 4%.
- [ ] T2: `defaultSwrFromCape` → 3% at CAPE 25; clamped to 4% at CAPE 10.
- [ ] T3: Zero-volatility synthetic dataset → matches closed-form amortization.
- [ ] T4: 1966-anchor bootstrap → within ±2pp of cFIREsim published success.
- [ ] T5: 2000-anchor bootstrap → within ±2pp of cFIREsim published success.
- [ ] T6: Guyton-Klinger starts higher than fixed-real at same success target.
- [ ] T7: `computeCoastFire(1.25M, 0.05, 30)` → ≈ $289k.
- [ ] T8: Cash-flow injection meaningfully reduces required portfolio.
- [ ] Confirm `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` all green.
- [ ] Commit: `feat(fire-engine): pure block-bootstrap engine + withdrawal rules + anchor tests`.

**Done when:** all 8 anchor tests pass with the seedable RNG.

---

## Phase 2 — Web Worker + Beginner tier (FIRST SHIPPABLE)

*Goal: a real, useful FIRE calculator live on production at the Beginner tier.*

### 2.1 Worker

- [ ] `src/features/fire-calculator/engine.worker.ts` — receive a `{ type: 'run', input }` message, call `runFireSimulation`, post `progress` and `done` / `error`. Same pattern as `src/features/monte-carlo/engine.worker.ts`.

### 2.2 Beginner UI

- [ ] `src/components/fire-calculator/HeadlineCard.tsx` — the visual hero. Giant FIRE number, the × multiple, the rate used, the CAPE indicator.
- [ ] `src/components/fire-calculator/SwrSlider.tsx` — slider with three preset chips: 3.9% Morningstar, valuation-aware default, 4.7% Bengen. Custom input also accepted.
- [ ] `src/components/fire-calculator/SpendingInput.tsx` — number field, $ suffix, comma-formatted display, validates non-negative.
- [ ] `src/components/fire-calculator/CapeIndicator.tsx` — reads bundled Shiller, displays "CAPE today X (as of YYYY-MM)" with an inline "override" link.
- [ ] `src/components/fire-calculator/Disclaimer.tsx` — persistent "educational only, not financial advice" callout.
- [ ] `src/pages/tools/FireCalculator.tsx` — wires the Beginner view together. Lazy-load the Shiller dataset on mount via `fetch(withBase('data/shiller.json'))`. Mounted-gate the heavy UI like `MonteCarloCalculator.tsx` does.

### 2.3 URL state

- [ ] `src/features/fire-calculator/url-state.ts` — encode/decode `PlanInput` as a query string (compact format per SPEC.md §6).
- [ ] Wire `FireCalculator.tsx` to read URL on mount and write back on input change (debounced).
- [ ] Add a "Copy link" button that emits the current URL.

### 2.4 Registry + routing

- [ ] In `src/features/tools/data.ts`, flip `fire-calculator` from `status: 'soon'` to `status: 'live'`.
- [ ] In `src/features/tools/registry.ts`, add `'fire-calculator': lazy(() => import('@/pages/tools/FireCalculator'))` to `LIVE_PAGES`.
- [ ] Confirm `scripts/load-tools.ts` automatically picks up the new live slug (sitemap regeneration on build).

### 2.5 SEO + Breadcrumbs

- [ ] Add `<Seo title="FIRE Calculator" description="..." path="/tools/fire-calculator" />`.
- [ ] Add a `<Breadcrumbs items={[{ label: 'Tools', to: '/tools' }, { label: 'FIRE Calculator' }]} />` at the top of the page.

### 2.6 Verify and ship

- [ ] `npm run typecheck` / `lint` / `test` / `build` all green.
- [ ] Local preview at `http://localhost:4321/tools/fire-calculator` renders the Beginner UI with the headline number visible.
- [ ] Optional: puppeteer smoke check (mirroring the existing `probe-tools.mjs` pattern) that the Beginner UI mounts without errors.
- [ ] Commit + push: `feat(fire-calculator): ship Beginner tier with valuation-aware headline + worker scaffolding`.
- [ ] Watch the GH Pages deploy succeed.
- [ ] Verify live at `https://theantfund.com/tools/fire-calculator`.

**Done when:** Beginner tier is live and the FIRE calculator appears in /tools and on the home page as "Available now."

---

## Phase 3 — Intermediate tier

*Goal: success probability + percentile fan + cash flows.*

- [ ] `src/components/fire-calculator/AdvancedInputsForm.tsx` (Intermediate subset) — current age, retirement age, life expectancy, allocation sliders, cash-flow list.
- [ ] `src/components/fire-calculator/CashFlowRow.tsx` — add/edit/remove a single income stream (label, start year, real amount, COLA mode).
- [ ] `src/components/fire-calculator/SuccessGauge.tsx` — semi-circular gauge 0–100% with three-zone band; accessible `role="img"` + name.
- [ ] Reuse `TrajectoryChart` from the MC calculator for the percentile fan (or fork into `src/components/fire-calculator/charts/` if shapes diverge).
- [ ] `src/components/fire-calculator/CashFlowGantt.tsx` — horizontal timeline of active cash flows.
- [ ] Wire a "Show me the simulation" disclosure on the Beginner page that hydrates the Intermediate view + dispatches the worker.
- [ ] Update URL-state encoder to include the new fields.
- [ ] Anchor tests T3, T4, T5, T8 should still pass; add an Intermediate-UI smoke test if helpful.
- [ ] Commit + push: `feat(fire-calculator): Intermediate tier with Monte Carlo + cash flows`.

**Done when:** Intermediate tier renders the success probability and percentile fan, with Social Security / pension inputs.

---

## Phase 4 — Advanced tier

*Goal: withdrawal-rule picker + stress tests + year-by-year table.*

- [ ] `src/components/fire-calculator/WithdrawalRulePicker.tsx` — segmented control with one-line descriptions for each rule.
- [ ] `src/components/fire-calculator/StressToggles.tsx` — "force bad first 5 years" + "LTC shock" toggles, each with an explanatory tooltip.
- [ ] Implement "force bad first 5 years" in the bootstrap sampler — replace the first 5 sampled blocks with one of: 1929-33 or 1973-77 (random choice per sim).
- [ ] Implement LTC shock — appends a one-time lumpy expense in the last 10% of the horizon (e.g., 2× annual spending in a single year).
- [ ] Reuse `YearByYearTable` from the MC calculator (or fork) for the detail-path table.
- [ ] Add a `taxPolicy` field to the form; only `'none'` is functional in v1 (`'simple-blended'` shown as "Coming soon" disabled).
- [ ] Add anchor tests T6 (rule swap raises starting rate) and a stress-toggle smoke test.
- [ ] Commit + push: `feat(fire-calculator): Advanced tier with rule picker + stress tests`.

**Done when:** Advanced tier exposes all five withdrawal rules and both stress tests work end-to-end.

---

## Phase 5 — Polish & ship

*Goal: a tool that doesn't embarrass you in front of an a11y auditor.*

- [ ] Keyboard navigation pass: tab through every input, slider, button. Focus rings visible.
- [ ] ARIA pass: every form control labelled, the success gauge has an `aria-label` like `"Success probability 85 percent — Workable, monitor and adjust"`.
- [ ] `prefers-reduced-motion`: charts skip the entrance animation.
- [ ] Mobile responsive verification at 320 / 768 / 1280 px. Beginner-tier headline fits on a phone.
- [ ] Add a `/blog/your-fi-number` cross-link directly into the live tool (replace or supplement the existing CTA to the MC calculator).
- [ ] Add a "How it works" expandable section linking back to the blog post (one paragraph each on: 4% rule, bootstrap MC, guardrails).
- [ ] Commit + push: `polish(fire-calculator): a11y + responsive + blog cross-links`.
- [ ] Final live verification with puppeteer smoke test of all three tiers.

**Done when:** the calculator is live, accessible, mobile-friendly, and connected to the surrounding content.

---

## Out-of-band cleanup (do anytime)

- [ ] Update `/blog/your-fi-number` post body to link to the live `/tools/fire-calculator` tool now that it exists. (Currently it points at the MC calculator only — appropriate when it was the only retirement tool.)
- [ ] Add an entry to the post's "Key takeaways" referencing the live tool.

## Cross-references

- [PLAN.md](./PLAN.md) — phasing rationale
- [SPEC.md](./SPEC.md) — contract for every type, default, and behavior
- [CLAUDE.md](./CLAUDE.md) — persistent context for future sessions
