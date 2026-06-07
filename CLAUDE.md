# CLAUDE.md — The Ant Fund

This file instructs Claude Code on how to build and maintain this project. Read it fully before generating any code, and keep it as the source of truth for architecture decisions.

---

## 1. Project Overview

**The Ant Fund** is a personal finance and investing website that helps everyday investors reach financial independence through interactive calculators, educational content, and investing insights. The brand voice is the patient, disciplined saver — slow and steady, jargon-free, approachable but trustworthy.

The entire site is a **static single-page application pre-rendered to static HTML**. There is **no backend, no database, and no runtime server**. After `npm run build`, the contents of `/dist` are plain HTML/CSS/JS that deploy directly to **GitHub Pages**.

> **Important — this is a content/media site, not financial advice.** Every page must carry a clear, visible disclaimer in the footer: "The Ant Fund publishes educational content and tools for informational purposes only. It is not financial, investment, tax, or legal advice." The Monte Carlo calculator must also show an inline disclaimer that its outputs are hypothetical projections, not guarantees.

---

## 2. Brand Identity (use exactly these tokens)

### Color palette
Define these as Tailwind theme colors and CSS variables. Do not invent other colors.

| Token | Hex | Usage |
|---|---|---|
| `teal` (primary) | `#15807D` | Primary brand, logo, buttons, links, headers |
| `teal-dark` | `#0D5957` | Headings, hover states, depth, text on light |
| `amber` (accent) | `#E09A33` | CTAs, highlights, the "coin" accent — use sparingly |
| `gold` | `#F2C44E` | Light highlights, badges, hover accents |
| `cream` | `#FBF6EE` | Page background (use instead of pure white) |
| `ink` | `#1C2826` | Body text (teal-tinted near-black, not pure black) |
| `surface` | `#FFFFFF` | Cards / raised surfaces on the cream background |
| `border` | `#E6E0D5` | Hairline borders, dividers |

**Usage rules:** teal is the backbone; amber is the spark reserved for things meant to be clicked or noticed (primary CTA, a highlighted stat). Do not flood the UI with amber — it loses impact. Cream is the page background; white is for cards. Body copy is `ink`, never `#000`.

### Typography
- **Headings:** `Fraunces` (warm serif, characterful, editorial). Weights 400/500/600.
- **Body:** `Inter` (clean sans, excellent small-size readability). Weights 400/500.
- Load both via `@fontsource/fraunces` and `@fontsource/inter` (npm packages, self-hosted — do **not** rely on Google Fonts CDN, so the site stays fully static and CSP-clean).
- Base body size 16px, line-height 1.7. Headings use Fraunces; everything else Inter.
- Sentence case for UI labels and headings. No ALL CAPS except small eyebrow/kicker labels with letter-spacing.

### Logo / favicon
- Favicon files already exist; place them in `/public`: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, and PNG sizes (16/32/48/180/512). Reference them from the document head (see SEO section).
- The header logo is the horizontal lockup: a small ant mark + the wordmark "the ant fund" in `teal-dark`. If no SVG mark asset is provided, render a clean text wordmark in Fraunces 600 as a placeholder and leave a clearly-commented slot to swap in the SVG.

---

## 3. Technology Stack (required)

- **React 18** + **Vite** (build tool)
- **TypeScript** throughout (strict mode on)
- **Tailwind CSS** for styling
- **Recharts** for all charts
- **React Router v6** for navigation
- **vite-react-ssg** for static pre-rendering of every route to HTML (critical for GitHub Pages + SEO — see §6)
- **react-helmet-async** (or vite-react-ssg's `Head`) for per-page meta tags
- **@fontsource/fraunces**, **@fontsource/inter** for self-hosted fonts
- Blog content stored as **static JSON/Markdown files** in the repo — no CMS, no API

**Hard constraints:**
- No backend services, no serverless functions, no SSR server.
- No Node runtime required after build — output is static files only.
- `npm run build` must emit static assets to `/dist`.
- Must deploy to GitHub Pages under a repository subpath (e.g. `https://<user>.github.io/theantfund/`) **and** work under a custom domain at root. Make the base path configurable (see §5).

---

## 4. Project Structure

Generate this folder structure:

```
theantfund/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon-512.png
│   ├── robots.txt
│   ├── CNAME                     # contains: theantfund.com (binds the custom domain)
│   ├── og-default.png            # default social share image
│   └── 404.html                  # SPA fallback (see §6)
├── src/
│   ├── main.tsx                  # vite-react-ssg entry
│   ├── App.tsx                   # route definitions
│   ├── routes.tsx                # exported routes array for SSG
│   ├── index.css                 # Tailwind directives + base styles
│   ├── components/
│   │   ├── layout/               # Header, Footer, Layout, Container, Nav
│   │   ├── ui/                   # Button, Card, Input, Select, Badge, Tag, Pagination, Spinner
│   │   ├── home/                 # Hero, Mission, FeaturedTools, Benefits, LatestArticles, Testimonials, Newsletter, CTA
│   │   ├── calculator/           # CalculatorForm, ResultsPanel, charts/, YearByYearTable
│   │   └── blog/                 # BlogCard, BlogList, BlogFilters, BlogSearch, ArticleBody
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx          # product hub + Monte Carlo calculator
│   │   ├── Blog.tsx              # listing
│   │   ├── BlogPost.tsx          # individual article (dynamic route)
│   │   └── NotFound.tsx
│   ├── features/
│   │   └── monte-carlo/
│   │       ├── engine.ts         # pure simulation functions (no React)
│   │       ├── engine.worker.ts  # Web Worker wrapper
│   │       ├── stats.ts          # percentile / summary helpers
│   │       ├── types.ts
│   │       └── defaults.ts
│   ├── content/
│   │   └── blog/
│   │       ├── index.ts          # imports + types all posts
│   │       └── posts/            # one .ts or .md per article (see §9)
│   ├── lib/
│   │   ├── seo.ts                # meta tag helpers
│   │   ├── format.ts             # currency / percent / number formatting
│   │   └── basePath.ts           # resolves BASE_URL for links & assets
│   ├── hooks/
│   └── types/
├── scripts/
│   └── generate-sitemap.ts       # builds sitemap.xml from routes at build time
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
├── package.json
└── README.md
```

Keep components small, typed, and reusable. Co-locate feature logic under `features/`. The Monte Carlo engine must be **pure TypeScript with zero React/DOM imports** so it is testable and runnable inside a Web Worker.

---

## 5. Vite & Path Configuration (GitHub Pages critical)

GitHub Pages serves project sites from a subpath (`/<repo>/`). Asset and router paths must respect this, or the deployed site loads a blank page with 404s on every asset.

`vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path: '/' because the site is served at the root of the custom domain
// theantfund.com. (If you ever deploy to a github.io subpath instead, set
// VITE_BASE_PATH=/theantfund/ at build time.) Controlled by env so CI can override.
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
```

Rules for Claude Code:
- **Never hardcode absolute asset paths** like `/assets/...`. Use Vite imports for images, and `import.meta.env.BASE_URL` for any runtime-built path (favicons, og images, internal links built as strings).
- React Router must be initialized with `basename={import.meta.env.BASE_URL}` so client navigation respects the subpath.
- Provide `src/lib/basePath.ts` exporting a `withBase(path: string)` helper that prefixes `import.meta.env.BASE_URL`, and use it everywhere a string URL is constructed.
- If the user later adds a custom domain, the only change needed is `VITE_BASE_PATH=/` at build time plus a `CNAME` file in `/public`. Document this in the README.

---

## 6. Routing, Static Pre-rendering & SEO

### Why pre-rendering (read this)
A vanilla React SPA ships one `index.html` and renders client-side. On GitHub Pages this breaks two things: (1) refreshing or directly linking a route like `/blog/slug` returns a 404 because no such file exists, and (2) crawlers and social scrapers see an empty shell, so meta/OG tags per page don't work — defeating the SEO requirement.

**Solution: use `vite-react-ssg`** to pre-render every route to a real static HTML file at build time. Output will include `/index.html`, `/products/index.html`, `/blog/index.html`, and `/blog/<slug>/index.html` for each article — each with its own fully-rendered content and meta tags. This is fully static and GitHub-Pages-native.

- Export the routes as a typed array (`src/routes.tsx`) consumed by both the app and the SSG entry.
- For dynamic blog routes, implement `getStaticPaths` to enumerate every post slug from `src/content/blog`.
- Use `vite-react-ssg`'s `<Head>` (or `react-helmet-async`) for per-page `<title>`, meta description, canonical, Open Graph, and Twitter Card tags.

### Fallback (if SSG is problematic)
Also generate `public/404.html` implementing the well-known SPA redirect trick (store the path in `sessionStorage`, redirect to root, restore on load) so deep links still resolve even in a pure-SPA configuration. Keep `BrowserRouter` (not `HashRouter`) so URLs stay clean.

### SEO deliverables (all must work statically)
- **Per-page meta tags:** unique `<title>` and `<meta name="description">` for every page and every blog post.
- **Open Graph:** `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (use the post's featured image; fall back to `/public/og-default.png`).
- **Twitter cards:** `summary_large_image` with matching fields.
- **Canonical URL** per page (absolute, using the production origin — make the origin a single configurable constant in `src/lib/seo.ts`, default `https://theantfund.com`).
- **`sitemap.xml`:** generated at build time by `scripts/generate-sitemap.ts` from the routes + blog slugs, written into `/dist` (or `/public` pre-build). Wire it into the build script.
- **`robots.txt`:** in `/public`, allowing all and pointing to the sitemap.
- **Structured data:** add JSON-LD `Article` schema on blog posts and `Organization` on the home page.
- Provide a single `<Seo>` component wrapping the head logic so pages just pass props.

---

## 7. Pages

### Page 1 — Home (`/`)
Introduce The Ant Fund and its mission. Sections, in order:
1. **Hero** — headline, subhead, two CTAs ("Try the retirement calculator" → primary amber button to `/products`; "Read the blog" → secondary teal-outline button). Ant/coin visual or abstract teal shape on cream.
2. **Mission statement** — short, the "slow and steady wealth for everyday people" thesis.
3. **Featured financial tools** — cards for the Monte Carlo calculator (live) and "coming soon" tools (FIRE, SWP, SIP, Net Worth, Rental ROI) shown as disabled/teaser cards.
4. **Benefits of retirement planning** — 3–4 benefit cards with icons.
5. **Latest articles preview** — pull the 3 most recent posts from blog content.
6. **Testimonials** — sample data (clearly fictional/sample), 2–3 cards.
7. **Newsletter signup** — frontend-only UI (email input + button). On submit, show a success state; do **not** post anywhere (no backend). Leave a clearly-commented integration point for a future email provider.
8. **Closing CTA** band.

Design: professional fintech feel, fully mobile-responsive, fast (lazy-load below-the-fold images), SEO-friendly head tags.

### Page 2 — Products (`/products`)
A product hub. The flagship product is the **Monte Carlo Retirement Calculator** (fully client-side, see §8). Below it, a **Future Products** section with teaser cards (FIRE, SWP, SIP, Net Worth Tracker, Rental Property ROI). Architect the calculator area so new calculators slot in as new routes/components under `features/` without refactoring (shared form primitives, shared chart components, shared results layout).

### Page 3 — Blog (`/blog` and `/blog/:slug`)
- **Listing (`/blog`):** grid of `BlogCard`s with featured image, title, category, author, date, excerpt. Include client-side **search** (title + content), **category filter**, **sort** (newest/oldest), and **pagination** (e.g. 9 per page).
- **Article (`/blog/:slug`):** full content, rendered from the post source. Pre-rendered to static HTML per §6. Include author, date, category, featured image, reading time, share buttons (plain links, no SDK), and a "related posts" strip. JSON-LD Article schema.

### 404 (`*`)
Friendly NotFound page with a link home and to the calculator.

---

## 8. Monte Carlo Retirement Calculator (detailed spec)

Build a fully client-side calculator. **Run the simulation in a Web Worker** (`engine.worker.ts`) so the UI never freezes; show a spinner/progress while it runs.

### User inputs (with sensible defaults in `defaults.ts`)
- Current age (e.g. 35)
- Retirement age (e.g. 60)
- Current portfolio value (e.g. 100,000)
- Monthly contribution (e.g. 1,500)
- Annual contribution increase % (e.g. 3)
- Inflation rate % (e.g. 3)
- Expected annual return % (e.g. 7)
- Return standard deviation % (e.g. 15)
- Annual withdrawal amount in today's dollars (e.g. 60,000)
- Withdrawal strategy: `fixed-real` (inflation-adjusted constant), `fixed-nominal`, or `percent-of-portfolio` (e.g. 4%)
- Life expectancy (e.g. 90)

Validate inputs (retirement age > current age, life expectancy > retirement age, non-negative values). Show inline validation messages.

### Simulation engine (`engine.ts` — pure functions)
Run **at least 10,000 simulations**. Each simulation models year-by-year from current age to life expectancy:

**Accumulation phase** (current age → retirement age), per year:
1. Draw a random annual return `r` from a normal distribution with mean = expected return and stdev = return stdev. Use the **Box–Muller transform** for normal draws. (Offer a `lognormal` option as a more realistic alternative and note it in code comments.)
2. Grow portfolio: `value = value * (1 + r)`.
3. Add that year's contribution: `annualContribution = monthly * 12`, increased each year by the annual contribution increase %.

**Decumulation phase** (retirement age → life expectancy), per year:
1. Compute the withdrawal for the year based on strategy:
   - `fixed-real`: `withdrawal * (1 + inflation)^(yearsFromToday)`
   - `fixed-nominal`: constant `withdrawal`
   - `percent-of-portfolio`: `pct * value` (with optional floor/ceiling)
2. Subtract withdrawal, then apply a random return draw `r` as above.
3. If `value <= 0` at any point, mark the run as **failed** (depleted) and record the depletion age; clamp value at 0 for the rest of the path.

Record for each run: the full year-by-year value path, terminal value, and success flag (success = portfolio > 0 at life expectancy).

**Determinism:** accept an optional seed for reproducible runs (seedable PRNG, e.g. mulberry32). Default to a fresh seed each run.

### Outputs (`stats.ts` + ResultsPanel)
Compute and display:
- **Success probability** and **failure probability** (% of runs that survived vs depleted).
- **Median terminal portfolio value**.
- **10th percentile** and **90th percentile** terminal outcomes.
- **Median depletion age** among failed runs (if any).
- All currency formatted via `lib/format.ts` (USD, no cents for large values).

### Charts (Recharts)
1. **Portfolio trajectory / survival chart** — an `AreaChart`/`LineChart` over age on the X axis showing percentile bands: 10th, 25th, median, 75th, 90th of portfolio value across all runs per year. Use teal for the median line and translucent teal/gold bands for the percentile ranges. This is the headline visual.
2. **Outcome distribution** — a histogram (`BarChart`) of terminal portfolio values bucketed into ranges, with success vs failure colored (teal = success, amber = depleted).
3. **Sample paths (optional)** — overlay a random sample of ~100 individual run paths at low opacity to convey dispersion. **Never plot all 10,000 paths** — sample for performance.
4. **Retirement outcome summary** — compact stat cards (success %, median, p10, p90) above the charts.

### Year-by-year table
Render a paginated/scrollable table of the **median path**: columns for age, year, start value, contribution or withdrawal, growth, end value. Allow toggling between viewing the median, p10, or p90 path.

### Performance notes
- 10,000 runs × ~55 years is light math; keep it in a Worker anyway to keep the main thread responsive and to allow a progress callback.
- Aggregate percentiles inside the worker; return only the aggregated series + summary + a small sample of raw paths, not all 10k full paths (keep the postMessage payload small).

### Disclaimer
Show a persistent note near the results: outputs are hypothetical Monte Carlo projections based on the assumptions entered, not predictions or guarantees, and not financial advice.

---

## 9. Blog Content System

Store posts as typed modules in `src/content/blog/posts/`. Each post exports an object matching:

```ts
export interface BlogPost {
  title: string;
  slug: string;          // url-safe, unique
  author: string;
  date: string;          // ISO 8601, e.g. "2025-09-12"
  category: string;      // e.g. "Retirement", "Investing Basics", "FIRE"
  excerpt: string;       // 1–2 sentence summary for cards + meta description
  featuredImage: string; // path under /public or imported asset
  readingTime?: number;  // minutes; compute if absent
  content: string;       // Markdown body (render with a markdown lib) OR MDX
}
```

`src/content/blog/index.ts` imports all posts, validates uniqueness of slugs, sorts by date, and exports helpers: `getAllPosts()`, `getPostBySlug()`, `getCategories()`, `getRecentPosts(n)`. These feed both the listing UI and `getStaticPaths` for SSG.

Render Markdown safely (e.g. `react-markdown` + `remark-gfm`); sanitize and style with Tailwind typography conventions matching the brand (Fraunces headings, Inter body, teal links).

**Generate at least 4 sample articles** with real, useful, original content (not lorem ipsum) on-brand topics, each ~600–900 words, with distinct categories. Suggested:
1. "How Monte Carlo simulation answers the question every retiree asks" (Retirement)
2. "The 4% rule, explained for normal people" (Retirement)
3. "Index funds vs. picking stocks: what the math actually says" (Investing Basics)
4. "What 'financial independence' really means (and how to size your number)" (FIRE)

Each sample article is educational and must include the not-financial-advice framing where relevant. Provide placeholder featured images in `/public` (simple branded color blocks are fine) referenced via `withBase`.

---

## 10. Configuration Files

Generate complete, working versions of:
- **`tailwind.config.ts`** — extend theme with the brand colors (§2) as named tokens (`teal`, `teal-dark`, `amber`, `gold`, `cream`, `ink`, `surface`, `border`), Fraunces as `fontFamily.serif`/`fontFamily.heading`, Inter as `fontFamily.sans`. Include `@tailwindcss/typography` for blog content.
- **`postcss.config.js`**, **`src/index.css`** with `@tailwind base/components/utilities` and font imports + base element styles (cream background, ink text, smooth scrolling, focus-visible outlines in teal).
- **`tsconfig.json`** — strict mode, path aliases (`@/` → `src/`).
- **`.eslintrc.cjs`** — TypeScript + React + react-hooks + jsx-a11y rules. Must pass with no errors.
- **`.prettierrc`** — sensible defaults (single quotes, trailing commas, 100 print width). Add `lint` and `format` npm scripts.
- **`package.json`** — scripts:
  - `dev`: `vite`
  - `build`: run sitemap generation, then `vite-react-ssg build`
  - `preview`: `vite preview`
  - `lint`: `eslint . --max-warnings 0`
  - `format`: `prettier --write .`
  - `typecheck`: `tsc --noEmit`

---

## 11. GitHub Actions Deployment Workflow

Generate `.github/workflows/deploy.yml` that builds and deploys to GitHub Pages on every push to `main`, using the official Pages actions (no third-party tokens needed):

```yaml
# Automatically builds and deploys the site to GitHub Pages on EVERY push to main.
# Each commit you push to the main branch triggers a fresh build + deploy with no manual step.
# (workflow_dispatch also adds a manual "Run workflow" button in the Actions tab.)
name: Deploy to GitHub Pages

on:
  push:
    branches: [main] # deploy on every commit pushed to main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          # Root deploy for the custom domain theantfund.com.
          VITE_BASE_PATH: /
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Notes for Claude Code:
- Ensure `npm ci` works from a committed `package-lock.json`.
- **Custom domain (required for this project):** create `public/CNAME` containing exactly `theantfund.com` (one line, no protocol, no trailing slash). Vite copies `/public` into `/dist`, so the `CNAME` ships with every deploy and GitHub Pages keeps the custom domain bound. `VITE_BASE_PATH` stays `/`.

---

## 12. README.md

Generate a README that **opens with this prominent first-run deploy checklist** (before anything else), because the site will not publish until step 2 is done once:

> ### 🚀 First-run deploy checklist (do this once)
> 1. Push this repo to GitHub with the default branch named **`main`**.
> 2. **Enable Actions as the Pages source:** repo **Settings → Pages → Build and deployment → Source → select "GitHub Actions"** (NOT "Deploy from a branch"). **This is required — until it's set, the workflow runs but nothing publishes.** This is the #1 cause of "the action succeeded but my site is blank/404."
> 3. **Set the custom domain:** repo **Settings → Pages → Custom domain → enter `theantfund.com` → Save.** This must match the `public/CNAME` file (which already contains `theantfund.com`). Tick **Enforce HTTPS** once it becomes available (can take a few minutes to an hour after DNS resolves).
> 4. **Point DNS at GitHub Pages** in your domain's DNS settings (Squarespace, where theantfund.com is registered):
>    - For the apex domain `theantfund.com`, add four `A` records pointing to GitHub's IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and/or the equivalent `AAAA` records if you want IPv6).
>    - For `www.theantfund.com`, add a `CNAME` record pointing to `<your-username>.github.io`.
>    - DNS changes can take anywhere from minutes to ~24 hours to propagate.
> 5. Done. From now on, **every commit pushed to `main` auto-builds and auto-deploys** via `.github/workflows/deploy.yml`. Watch progress in the **Actions** tab; the live site is **https://theantfund.com**.
>
> No manual deploy step is ever needed again — push to main and the site updates itself.

Then cover:
- Project description and brand.
- Local dev: `npm install`, `npm run dev`.
- Build & preview: `npm run build`, `npm run preview`.
- **GitHub Pages setup instructions**, step by step:
  1. Push the repo to GitHub with the default branch `main`.
  2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
  3. Confirm the workflow runs on push; the site appears at `https://<user>.github.io/<repo>/`.
  4. **Custom domain (this project's default):** the site is built with `VITE_BASE_PATH=/` and ships a `public/CNAME` file containing `theantfund.com`, so it serves from the root of the custom domain. The DNS + Pages custom-domain steps are in the first-run checklist above. (If you ever need a plain `github.io/theantfund/` subpath build instead, set `VITE_BASE_PATH=/theantfund/` and remove the CNAME.)
- How to add a blog post (drop a new file in `src/content/blog/posts/`, follow the `BlogPost` interface).
- How to add a new calculator (create a feature folder + route; reuse shared form/chart/result primitives).
- Lint/format/typecheck commands.

---

## 13. Code Quality & Accessibility

- **TypeScript strict** everywhere; no `any` unless justified with a comment.
- Reusable, composable components; no copy-paste duplication.
- Modular folders as in §4; keep the Monte Carlo engine framework-agnostic and unit-testable.
- **ESLint + Prettier** must pass cleanly (`npm run lint` zero warnings, `npm run typecheck` clean).
- **Accessibility:** semantic HTML, labelled form inputs, keyboard-navigable controls, visible focus states (teal outline), sufficient color contrast (verify amber/gold text combos against backgrounds — use `teal-dark`/`ink` for text on light, never low-contrast gold-on-cream for body text), `alt` text on images, charts have accessible text summaries / `aria-label`s, and `prefers-reduced-motion` respected for any animation.
- **Responsive:** mobile-first; verify the calculator form, charts, and blog grid all reflow cleanly at 320px, 768px, and 1280px.
- **Performance:** code-split routes, lazy-load Recharts on the calculator route, lazy-load below-the-fold images, keep the worker payload small.

---

## 14. Definition of Done (acceptance criteria)

The build is complete when all of the following hold:
1. `npm install` then `npm run build` succeeds and emits static files to `/dist`.
2. `npm run preview` serves a working site; **every** route (home, products, blog listing, each blog post, 404) loads correctly **and** survives a hard refresh / direct link.
3. Deployed to GitHub Pages under `/theantfund/`, all assets, fonts, favicons, and internal links resolve (no 404s, no blank page).
4. The Monte Carlo calculator runs ≥10,000 simulations in a Web Worker without freezing the UI, validates inputs, and renders all required outputs, charts, and the year-by-year table.
5. Blog search, category filter, sort, and pagination all work client-side; individual posts pre-render to static HTML with correct per-page meta/OG/Twitter tags and JSON-LD.
6. `sitemap.xml` and `robots.txt` are present in the deployed output and reference real URLs.
7. `npm run lint` and `npm run typecheck` pass with zero errors.
8. Footer disclaimer and calculator disclaimer are present on all relevant pages.
9. Brand colors and fonts match §2 exactly.

---

## 15. Guardrails

- Do not introduce a backend, database, auth, or any service requiring secrets or a running server.
- Do not use Google Fonts CDN or other external runtime dependencies that would break offline/static hosting or CSP — self-host fonts via `@fontsource/*`.
- Do not hardcode the production origin or base path in scattered places — centralize in `src/lib/seo.ts` and `src/lib/basePath.ts`.
- Do not plot all simulation paths; always sample.
- Keep all financial content framed as educational, never as advice.
- Prefer clarity and small modules over cleverness. When a tradeoff arises, optimize for "a future contributor can add a calculator or a blog post in minutes."
