// Emits public/sitemap.xml so Vite copies it into /dist on build.
// Run via `npm run build` (sequenced before vite-react-ssg build).
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAllPosts } from './load-posts';

const SITE_ORIGIN = 'https://theantfund.com';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const staticPaths = ['/', '/products', '/blog'];
const posts = loadAllPosts();

const now = new Date().toISOString().slice(0, 10);

function urlBlock(path: string, lastmod: string): string {
  // Match the canonical URL format the Seo component emits: trailing slash on
  // the home page only, no trailing slash on any other route. Mismatch between
  // sitemap and canonical confuses crawlers about which URL is authoritative.
  const loc = path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

const staticUrls = staticPaths.map((p) => urlBlock(p, now)).join('\n');
const postUrls = posts
  .map((p) => urlBlock(`/blog/${p.slug}`, p.date))
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
</urlset>
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, 'sitemap.xml'), xml, 'utf8');

// eslint-disable-next-line no-console
console.log(
  `Wrote sitemap with ${staticPaths.length} static URLs + ${posts.length} posts`,
);
