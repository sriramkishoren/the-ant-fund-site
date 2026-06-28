import readingTime from 'reading-time';
import type { BlogPost } from './types';
import { parseFrontmatter } from './parseFrontmatter';

// Glob every .md file under posts/ at build time. `?raw` returns the file
// contents as a string. `eager: true` so SSG sees all posts synchronously.
const rawFiles = import.meta.glob('./posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function requireString(
  data: Record<string, unknown>,
  key: string,
  filePath: string,
): string {
  const v = data[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Blog post ${filePath}: missing required string field "${key}"`);
  }
  return v;
}

function optionalString(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = data[key];
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function optionalStringArray(
  data: Record<string, unknown>,
  key: string,
): string[] {
  const v = data[key];
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
  return [];
}

function slugFromFilename(path: string): string {
  const file = path.split('/').pop() ?? '';
  return file.replace(/\.md$/, '');
}

function loadPost(filePath: string, source: string): BlogPost {
  const { data, body } = parseFrontmatter(source);
  const fm = data as unknown as Record<string, unknown>;

  const fileSlug = slugFromFilename(filePath);
  const slug = optionalString(fm, 'slug') ?? fileSlug;

  const fmReadingTime = typeof fm.readingTime === 'number' ? fm.readingTime : undefined;
  const computedReadingTime = Math.max(1, Math.round(readingTime(body).minutes));

  return {
    title: requireString(fm, 'title', filePath),
    slug,
    author: optionalString(fm, 'author') ?? 'The Ant Fund',
    date: requireString(fm, 'date', filePath),
    category: requireString(fm, 'category', filePath),
    tags: optionalStringArray(fm, 'tags'),
    excerpt: requireString(fm, 'excerpt', filePath),
    description: optionalString(fm, 'description'),
    featuredImage: optionalString(fm, 'featuredImage') ?? '/og-default.png',
    featuredImageAlt: optionalString(fm, 'featuredImageAlt') ?? '',
    readingTime: fmReadingTime ?? computedReadingTime,
    content: body,
  };
}

const rawPosts: BlogPost[] = Object.entries(rawFiles).map(([path, source]) =>
  loadPost(path, source),
);

// Validate slug uniqueness up-front so a duplicate fails the build instead of
// silently shadowing a route.
const seen = new Set<string>();
for (const p of rawPosts) {
  if (seen.has(p.slug)) {
    throw new Error(`Duplicate blog post slug: ${p.slug}`);
  }
  seen.add(p.slug);
}

// Sort newest → oldest by ISO date string.
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

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}

export function getRelatedPosts(slug: string, n = 3): BlogPost[] {
  const target = posts.find((p) => p.slug === slug);
  if (!target) return [];
  const sameCategory = posts.filter(
    (p) => p.slug !== slug && p.category === target.category,
  );
  if (sameCategory.length >= n) return sameCategory.slice(0, n);
  // Fall back to other recent posts to pad out.
  const fill = posts.filter(
    (p) => p.slug !== slug && !sameCategory.includes(p),
  );
  return [...sameCategory, ...fill].slice(0, n);
}

export function getAdjacentPosts(slug: string): {
  prev: BlogPost | null;
  next: BlogPost | null;
} {
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  // `posts` is sorted newest → oldest. "next" (chronologically newer) is at
  // index-1; "prev" (older) is at index+1.
  return {
    next: idx > 0 ? posts[idx - 1] : null,
    prev: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}

export type { BlogPost };
