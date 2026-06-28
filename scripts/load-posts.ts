// Node-side post loader used by build scripts (sitemap, RSS). The browser /
// SSG build uses src/content/blog/index.ts which globs via import.meta.glob.
// This file reads the same .md files from the filesystem so scripts stay in
// sync without coupling them to Vite's module graph.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readingTime from 'reading-time';
import { parseFrontmatter } from '../src/content/blog/parseFrontmatter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = resolve(__dirname, '..', 'src', 'content', 'blog', 'posts');

export interface ScriptPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  description?: string;
  author: string;
  featuredImage: string;
  content: string;
  readingTime: number;
}

export function loadAllPosts(): ScriptPost[] {
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const source = readFileSync(resolve(postsDir, file), 'utf8');
    const { data, body } = parseFrontmatter(source);
    const fm = data as Record<string, unknown>;

    const slugFromFile = file.replace(/\.md$/, '');
    const slug = typeof fm.slug === 'string' && fm.slug.trim() ? fm.slug : slugFromFile;

    return {
      slug,
      title: String(fm.title ?? ''),
      date: String(fm.date ?? ''),
      category: String(fm.category ?? ''),
      excerpt: String(fm.excerpt ?? ''),
      description:
        typeof fm.description === 'string' ? fm.description : undefined,
      author:
        typeof fm.author === 'string' && fm.author.trim()
          ? fm.author
          : 'The Ant Fund',
      featuredImage:
        typeof fm.featuredImage === 'string'
          ? fm.featuredImage
          : '/og-default.png',
      content: body,
      readingTime:
        typeof fm.readingTime === 'number'
          ? fm.readingTime
          : Math.max(1, Math.round(readingTime(body).minutes)),
    } satisfies ScriptPost;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
