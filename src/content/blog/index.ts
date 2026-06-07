import type { BlogPost } from './types';
import monteCarlo from './posts/monte-carlo-explained';
import fourPct from './posts/four-percent-rule';
import indexVsStocks from './posts/index-vs-stocks';
import fiNumber from './posts/your-fi-number';

const rawPosts: BlogPost[] = [monteCarlo, fourPct, indexVsStocks, fiNumber];

// Validate slug uniqueness up-front so a duplicate fails the build instead of
// silently shadowing a route.
const seen = new Set<string>();
for (const p of rawPosts) {
  if (seen.has(p.slug)) {
    throw new Error(`Duplicate blog post slug: ${p.slug}`);
  }
  seen.add(p.slug);
}

const posts = [...rawPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getRecentPosts(n: number): BlogPost[] {
  return posts.slice(0, n);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getCategories(): string[] {
  return Array.from(new Set(posts.map((p) => p.category))).sort();
}

export type { BlogPost };
