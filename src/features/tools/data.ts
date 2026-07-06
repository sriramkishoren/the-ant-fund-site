// Pure metadata for every tool. No React imports — so this file can be loaded
// from Node-side build scripts (sitemap, RSS) and from the browser runtime
// without dragging the React Lazy machinery through tsx.
//
// To add a new tool:
//   1. Add an entry here.
//   2. If status === 'live', also drop a Page component into
//      src/pages/tools/<X>.tsx and reference it in registry.ts.

export type ToolStatus = 'live' | 'soon';

export interface ToolMeta {
  /** URL slug under /tools/. Stable; do not rename after launch. */
  slug: string;
  /** Full marketing name. */
  name: string;
  /** Short display name for tight UI (cards, nav). Falls back to `name`. */
  shortName?: string;
  /** One- to two-sentence description for tiles, cards, and meta descriptions. */
  description: string;
  /** Free-form category label (e.g. "Retirement", "Investing"). */
  category: string;
  /** "live" tools have a working Page; "soon" tools render as inert teasers. */
  status: ToolStatus;
}

export const TOOL_METAS: ToolMeta[] = [
  {
    slug: 'monte-carlo-retirement-calculator',
    name: 'Monte Carlo Retirement Calculator',
    shortName: 'Monte Carlo retirement',
    description:
      'Run 10,000 simulations of your retirement plan in your browser. See how often the plan survives, what the bad cases look like, and where the assumptions matter most.',
    category: 'Retirement',
    status: 'live',
  },
  {
    slug: 'fire-calculator',
    name: 'FIRE Calculator',
    shortName: 'FIRE number',
    description:
      'Translate your annual spending into a financial-independence target with a valuation-aware safe withdrawal rate. Runs entirely in your browser.',
    category: 'FIRE',
    status: 'live',
  },
  {
    slug: 'bucket-strategy-planner',
    name: 'Bucket Strategy Planner',
    shortName: 'Bucket strategy',
    description:
      'Plan and stress-test a two-bucket retirement withdrawal strategy — a stability bucket funds spending, a growth bucket refills it — with research-backed guardrail rules, Monte Carlo success rates, and a January-2000 dot-com stress test.',
    category: 'Retirement',
    status: 'live',
  },
  {
    slug: 'investment-calculator',
    name: 'Investment Calculator',
    shortName: 'Investment growth',
    description:
      'Project how contributions and compounding grow an investment — or solve for the contribution, return, starting amount, or time you need to hit a goal. Compare scenarios side by side.',
    category: 'Investing',
    status: 'live',
  },
  {
    slug: 'rental-property-roi',
    name: 'Rental Property ROI',
    description:
      'Run the numbers on a rental — cash flow, cap rate, and long-run total return — before you commit.',
    category: 'Real estate',
    status: 'soon',
  },
];

export function getLiveToolMetas(): ToolMeta[] {
  return TOOL_METAS.filter((t) => t.status === 'live');
}
