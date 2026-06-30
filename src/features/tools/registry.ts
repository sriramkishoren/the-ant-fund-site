// React-side tool registry. Adds a lazy Page loader to each live tool's
// metadata. The pure metadata (slug/name/description/status) lives in data.ts
// so Node-side build scripts (sitemap, RSS) can read the same source of truth
// without dragging React's Lazy machinery through tsx.
//
// To add a new live tool:
//   1. Add the metadata to data.ts with status: 'live'
//   2. Drop a Page component into src/pages/tools/<X>.tsx
//   3. Add a `LIVE_PAGES` entry below mapping the slug to its lazy loader

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  TOOL_METAS,
  type ToolMeta,
  type ToolStatus,
} from './data';

const LIVE_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  'monte-carlo-retirement-calculator': lazy(
    () => import('@/pages/tools/MonteCarloCalculator'),
  ),
  'fire-calculator': lazy(() => import('@/pages/tools/FireCalculator')),
};

export interface ToolDef extends ToolMeta {
  /** Lazy-loaded page component. Present only for live tools. */
  Page?: LazyExoticComponent<ComponentType>;
}

export const TOOLS: ToolDef[] = TOOL_METAS.map((meta) => ({
  ...meta,
  Page: meta.status === 'live' ? LIVE_PAGES[meta.slug] : undefined,
}));

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getLiveTools(): ToolDef[] {
  return TOOLS.filter((t) => t.status === 'live');
}

export function getSoonTools(): ToolDef[] {
  return TOOLS.filter((t) => t.status === 'soon');
}

export function getLiveToolSlugs(): string[] {
  return getLiveTools().map((t) => t.slug);
}

export type { ToolMeta, ToolStatus };
