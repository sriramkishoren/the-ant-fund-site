// Chapter loader. Mirrors the blog pipeline: markdown files are globbed at
// build time, frontmatter is validated up-front so a typo fails the build
// rather than silently producing an empty field, and chapters attach to a
// course by slug.

import readingTime from 'reading-time/lib/reading-time.js';
import { parseFrontmatter } from '@/content/blog/parseFrontmatter';
import { getCourseBySlug, getAllCourses } from './courses';
import type { Chapter, Course } from './types';

const rawFiles = import.meta.glob('./chapters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

type Fm = Record<string, unknown>;

function requireString(data: Fm, key: string, file: string): string {
  const v = data[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Chapter ${file}: missing required string field "${key}"`);
  }
  return v;
}

function optionalString(data: Fm, key: string): string | undefined {
  const v = data[key];
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function stringArray(data: Fm, key: string): string[] {
  const v = data[key];
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
  return [];
}

function slugFromFilename(path: string): string {
  return (path.split('/').pop() ?? '').replace(/\.md$/, '');
}

function loadChapter(filePath: string, source: string): Chapter {
  const { data, body } = parseFrontmatter(source);
  const fm = data as unknown as Fm;

  const courseSlug = requireString(fm, 'course', filePath);
  if (!getCourseBySlug(courseSlug)) {
    throw new Error(
      `Chapter ${filePath}: unknown course "${courseSlug}". Add it to src/content/learn/courses.ts first.`,
    );
  }

  const order = fm.order;
  if (typeof order !== 'number' || !Number.isFinite(order)) {
    throw new Error(`Chapter ${filePath}: "order" must be a number`);
  }

  return {
    slug: optionalString(fm, 'slug') ?? slugFromFilename(filePath),
    courseSlug,
    order,
    title: requireString(fm, 'title', filePath),
    excerpt: requireString(fm, 'excerpt', filePath),
    description: optionalString(fm, 'description'),
    agenda: stringArray(fm, 'agenda'),
    date: requireString(fm, 'date', filePath),
    readingTime:
      typeof fm.readingTime === 'number'
        ? fm.readingTime
        : Math.max(1, Math.round(readingTime(body).minutes)),
    relatedPosts: stringArray(fm, 'relatedPosts'),
    relatedTools: stringArray(fm, 'relatedTools'),
    content: body,
  };
}

const chapters: Chapter[] = Object.entries(rawFiles).map(([path, src]) =>
  loadChapter(path, src),
);

// A duplicate slug would silently shadow a route; a duplicate order within a
// course would make "chapter 3" ambiguous. Both fail the build instead.
const seenSlugs = new Set<string>();
const seenOrder = new Set<string>();
for (const c of chapters) {
  if (seenSlugs.has(c.slug)) throw new Error(`Duplicate chapter slug: ${c.slug}`);
  seenSlugs.add(c.slug);
  const key = `${c.courseSlug}#${c.order}`;
  if (seenOrder.has(key)) {
    throw new Error(`Duplicate chapter order ${c.order} in course "${c.courseSlug}"`);
  }
  seenOrder.add(key);
}

export function getChaptersForCourse(courseSlug: string): Chapter[] {
  return chapters
    .filter((c) => c.courseSlug === courseSlug)
    .sort((a, b) => a.order - b.order);
}

export function getChapter(courseSlug: string, chapterSlug: string): Chapter | undefined {
  return chapters.find((c) => c.courseSlug === courseSlug && c.slug === chapterSlug);
}

export function getAdjacentChapters(courseSlug: string, chapterSlug: string): {
  prev: Chapter | null;
  next: Chapter | null;
} {
  const list = getChaptersForCourse(courseSlug);
  const i = list.findIndex((c) => c.slug === chapterSlug);
  if (i === -1) return { prev: null, next: null };
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

export function getChapterCount(courseSlug: string): number {
  return getChaptersForCourse(courseSlug).length;
}

/** Every published chapter path, for static pre-rendering. */
export function getAllChapterPaths(): { course: string; chapter: string }[] {
  return chapters.map((c) => ({ course: c.courseSlug, chapter: c.slug }));
}

/** Most recently published chapters across all courses, for the hub. */
export function getLatestChapters(n: number): Chapter[] {
  return [...chapters].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, n);
}

export { getAllCourses, getCourseBySlug };
export type { Chapter, Course };
