# FIRE Number Calculator — PLAN

The how-and-when. SPEC.md has the what; TODO.md has the ordered work list; CLAUDE.md has the persistent context. Read these four together.

## 1. Why build this

We've already published the long-form research-driven post — [Your FIRE number: every major method, calculated and compared](/blog/your-fi-number). It explains the methodology end-to-end. The natural next step is the **tool** that lets a reader run their own numbers without leaving the site.

The existing standalone Monte Carlo calculator at `/tools/monte-carlo-retirement-calculator` is a simpler, single-method tool (i.i.d. Gaussian, fixed-real spending). The FIRE calculator is the **layered hybrid** described in the blog post: a deterministic headline number up front, a historical-bootstrap simulation engine underneath, dynamic-spending and multi-source-income layers behind progressive disclosure.

Both tools coexist. The FIRE calculator does not deprecate the Monte Carlo one.

## 2. Decisions locked from the kickoff round

| Question | Choice | Why this matters |
|---|---|---|
| **Aesthetic** | Keep the existing brand (Fraunces + Inter + cream + teal/amber) | No Sora / DM Sans / white reskin. Tool stays native to the site. The CLAUDE.md brand book is authoritative. |
| **Default asset allocation** | 80% stocks / 20% bonds | Standard FIRE-community accumulator default. Can be changed by the user in Intermediate tier. |
| **CAPE source** | Bundled Shiller dataset + manual override | Refreshed at build time. UI shows "as of YYYY-MM-DD." User can type a value to override for what-ifs. |
| **Engine relationship** | Separate engine in `src/features/fire-calculator/` | Existing MC calculator untouched. Two tools, two engines, types may be reused selectively. |

## 3. What "done" looks like

A working tool at `/tools/fire-calculator`, fully client-side, that:

1. Renders a **Beginner** headline `spending × multiplier` instantly with a valuation-aware default SWR and slider presets at **3.9% (Morningstar 2026)** and **4.7% (Bengen 2025)**.
2. Unlocks an **Intermediate** view with a 10,000-run block-bootstrap Monte Carlo over the user's actual horizon. Reports a success probability **and** a P10/P50/P90 percentile fan. Supports Social Security and pension cash-flow injections.
3. Unlocks an **Advanced** view with the full withdrawal-rule picker (fixed-real, risk-based guardrails as the advanced default, Guyton-Klinger, VPW, RMD), multi-source income, sequence-of-returns stress tests, and a long-term-care shock toggle. Tax engine is **scaffolded as a hook but not implemented** in v1.
4. Persists plan state in the URL so plans are shareable.
5. Carries the persistent "educational only, not financial advice" disclaimer everywhere a number is shown.
6. Pre-renders to a static HTML file via `vite-react-ssg` like every other route; the worker-driven heavy lifting hydrates client-side.
7. Passes `npm run typecheck`, `npm run lint`, `npm run build` with zero errors/warnings.
8. Listed as **live** in the tools registry at `src/features/tools/data.ts` and surfaced on the `/tools` landing page and the home page tile grid.

## 4. The journey — five phases, shippable at each step

Phases ship **in order**. Each one is a real, useful state on its own, behind a feature-flag-free release. The point is that the project never has a long unshippable middle.

### Phase 0 — Data & scaffolding (no user-visible change yet)

- Bundle Shiller's monthly historical dataset (S&P price, dividends, earnings, long-rate, CPI, derived CAPE) as a static JSON in `public/data/shiller.json`.
- Add `scripts/build-shiller-dataset.ts` documenting how the JSON is produced (so future contributors can refresh it).
- Create the folder scaffold `src/features/fire-calculator/` and `src/pages/tools/FireCalculator.tsx`.
- Update the tool registry: leave `fire-calculator` as `'soon'` for now (no link from the user UI until Phase 2 ships).

### Phase 1 — Pure engine + tests (no UI yet)

- TypeScript types: `PlanInput`, `PlanResult`, `CashFlow`, `WithdrawalRule`, `Allocation`.
- Seedable PRNG (mulberry32) and a Box-Muller helper for any places where Gaussian is genuinely needed.
- **Block-bootstrap sampler** drawing 5-year overlapping blocks from the Shiller dataset jointly across returns and inflation.
- Simulation loop: takes a `PlanInput`, a withdrawal rule, and a sampler; returns per-year balances for one path.
- Withdrawal rules behind a `WithdrawalRule` strategy interface: `fixed-real`, `risk-based-guardrails`, `guyton-klinger`, `vpw`, `rmd`. Adding a sixth rule must be a one-file change.
- Aggregator: 10,000-run driver producing success probability + percentile fans + median-path detail.
- Anchor tests with the seedable RNG:
  - 4% rule (fixed-real, zero-volatility path) returns exactly × 25.
  - Zero-volatility constant-return path matches the closed-form amortization.
  - 1966 and 2000 historical starts line up with published cFIREsim results within rounding.

### Phase 2 — Web Worker + Beginner tier (FIRST SHIPPABLE)

- Web Worker wrapping the engine with progress callbacks.
- `src/pages/tools/FireCalculator.tsx` Beginner view: a spending input, a CAPE-aware default SWR rate slider (with the 3.9% and 4.7% presets), and the headline FIRE number rendered as the visual hero. The deterministic headline stays synchronous; the worker is not used at this tier.
- URL state persistence (query string).
- Register the tool as **live** in `src/features/tools/data.ts` and add `Page: lazy(...)` in `src/features/tools/registry.ts`.
- Sitemap regenerates (the script already reads from the data module).
- This is the first ship: a real, useful Beginner calculator live in production.

### Phase 3 — Intermediate tier

- A "Show me the simulation" disclosure that unlocks the Intermediate view.
- Calls the worker with horizon, allocation, and cash flows. Streams progress.
- Charts: success-rate gauge and a P10/P50/P90 percentile fan over the actual horizon.
- Social Security and pension inputs as dated cash-flow injections (each: start year, real-dollar amount, CPI-linked toggle).
- Fixed-real spending only at this tier — the Advanced rules come next.

### Phase 4 — Advanced tier

- "Advanced settings" disclosure unlocks the withdrawal-rule picker (fixed-real, risk-based guardrails as default-advanced, Guyton-Klinger, VPW, RMD).
- Multi-source income with full per-source COLA + taxability flags.
- Stress tests: "force a bad first 5 years" (the retirement red zone) and a long-term-care shock toggle that lowers the safe rate ~0.4 percentage points.
- Tax engine: scaffolded as a `taxPolicy` field on `PlanInput` that defaults to `'none'` for v1. A `'simple-blended'` placeholder may compute a pre-tax gross-up, but full account-bucket logic is **deferred to v2**.

### Phase 5 — Polish & ship

- Keyboard navigation pass + ARIA labels on every interactive control.
- Mobile responsive verification at 320px / 768px / 1280px.
- Cross-link from the `/blog/your-fi-number` post into the live tool (today it points at the Monte Carlo calculator only).
- Add a small "How it works" callout linking back to the blog post for users who want the methodology depth.

## 5. Out of scope for v1 (explicit non-goals)

- **Full tax engine.** Account-type buckets, Roth-conversion ladders, IRMAA, state taxes, Social Security taxability — too much surface area for v1. Scaffolded hook, not implemented.
- **Live CAPE fetch.** Build-time bundling only. No runtime HTTP calls (privacy / static-deploy constraint).
- **Saved plans across devices.** URL state is the only persistence mechanism.
- **Currency other than USD.** Engine is currency-agnostic in principle; UI labels USD only.
- **International / non-US historical data.** US Shiller dataset only. The existing blog post already names the survivorship-bias caveat.
- **Asset-class breakdown beyond stocks / bonds / cash.** No factor tilts, sector bets, individual securities.
- **Glide paths.** Single static allocation in v1. Glide path is a v2 feature.

## 6. Risks & how we mitigate

| Risk | Mitigation |
|---|---|
| **Bootstrap implementation bug silently produces wrong probabilities.** | Anchor tests against cFIREsim's published 1966 and 2000 results. Seedable RNG so test runs are reproducible. |
| **Worker fails to load in some browsers or under preview servers.** | Same fallback pattern as the existing MC calculator — main-thread execution if `new Worker(...)` construction throws. The math is fast enough to be acceptable on-thread. |
| **Shiller JSON inflates bundle size.** | Lazy-load it inside the Calculator chunk, not the app bundle. The dataset is ~150 KB compressed; acceptable for a route-level chunk. |
| **Hydration mismatch from worker code touching `window` during SSG.** | Same `mounted` gate pattern as `MonteCarloCalculator.tsx` — render a static fallback during SSG, mount the live UI on the client. |
| **Brand drift.** | The CLAUDE.md brand book and Fraunces+Inter+cream are authoritative. No Sora / DM Sans / white. The locked decision from the kickoff round overrides the prompt's aesthetic directive. |
| **Methodology re-debate.** | The three techniques are settled. The feature-scoped CLAUDE.md records that fact explicitly so future sessions don't re-litigate it. |

## 7. Cross-references

- Existing standalone calculator: `src/features/monte-carlo/` and `src/pages/tools/MonteCarloCalculator.tsx`. **Do not modify** — coexists.
- Blog post the tool implements: `src/content/blog/posts/your-fi-number.md`.
- Tool registry (single source of truth for `/tools` routing + sitemap): `src/features/tools/data.ts` and `src/features/tools/registry.ts`.
- Root brand/build book: `/CLAUDE.md` — authoritative for site-wide concerns (colors, fonts, accessibility, deploy).
- Feature-scoped context for future sessions: `docs/fire-calculator/CLAUDE.md`.

## 8. Confirmation gate

This document, [SPEC.md](./SPEC.md), [TODO.md](./TODO.md), and [CLAUDE.md](./CLAUDE.md) are produced together as a planning bundle. Implementation does **not** begin until the human reviewer confirms.
