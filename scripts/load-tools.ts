// Node-side enumeration of live tool slugs, used by the sitemap (and any
// future build-time generator). Reads the same metadata module that the
// React-side registry consumes so there's a single source of truth.
import { getLiveToolMetas } from '../src/features/tools/data';

export function loadLiveToolSlugs(): string[] {
  return getLiveToolMetas().map((t) => t.slug);
}
