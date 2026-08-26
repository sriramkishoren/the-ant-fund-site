// Node-side course/chapter enumeration for build scripts (sitemap). Mirrors
// load-posts.ts: reads the same .md files from disk and the same course
// manifest the app uses, so nothing can drift out of sync.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../src/content/blog/parseFrontmatter';
import { getAllCourses } from '../src/content/learn/courses';

const __dirname = dirname(fileURLToPath(import.meta.url));
const chaptersDir = resolve(__dirname, '..', 'src', 'content', 'learn', 'chapters');

export interface ScriptChapter {
  courseSlug: string;
  slug: string;
  date: string;
}

export function loadCourseSlugs(): string[] {
  return getAllCourses().map((c) => c.slug);
}

export function loadAllChapters(): ScriptChapter[] {
  if (!existsSync(chaptersDir)) return [];
  return readdirSync(chaptersDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data } = parseFrontmatter(readFileSync(resolve(chaptersDir, file), 'utf8'));
      const fm = data as Record<string, unknown>;
      const slugFromFile = file.replace(/\.md$/, '');
      return {
        courseSlug: String(fm.course ?? ''),
        slug: typeof fm.slug === 'string' && fm.slug.trim() ? fm.slug : slugFromFile,
        date: String(fm.date ?? ''),
      } satisfies ScriptChapter;
    });
}
