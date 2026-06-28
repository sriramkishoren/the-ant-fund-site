// Emits public/rss.xml — RSS 2.0 feed of every blog post. Vite copies it into
// /dist on build. Re-runs on every `npm run build` so new posts show up.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAllPosts } from './load-posts';

const SITE_ORIGIN = 'https://theantfund.com';
const SITE_TITLE = 'The Ant Fund';
const SITE_DESCRIPTION =
  'Slow, steady wealth for everyday investors — calculators, education, and clear thinking on the road to financial independence.';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(dateIso: string): string {
  return new Date(`${dateIso}T12:00:00Z`).toUTCString();
}

const posts = loadAllPosts();
const buildDate = new Date().toUTCString();

const items = posts
  .map((post) => {
    const url = `${SITE_ORIGIN}/blog/${post.slug}`;
    return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <category>${xmlEscape(post.category)}</category>
      <description>${xmlEscape(post.excerpt)}</description>
    </item>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_TITLE)}</title>
    <link>${SITE_ORIGIN}</link>
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_ORIGIN}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, 'rss.xml'), xml, 'utf8');

// eslint-disable-next-line no-console
console.log(`Wrote RSS feed with ${posts.length} items`);
