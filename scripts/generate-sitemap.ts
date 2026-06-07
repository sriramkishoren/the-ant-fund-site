// Emits public/sitemap.xml so Vite copies it into /dist on build.
// Run via `npm run build` (sequenced before vite-react-ssg build).
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://theantfund.com';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

// Static routes. Blog post slugs will be appended once content is wired up.
const staticPaths = ['/', '/products', '/blog'];

const now = new Date().toISOString().slice(0, 10);

const urls = staticPaths
  .map(
    (path) => `  <url>
    <loc>${SITE_ORIGIN}${path === '/' ? '' : path}/</loc>
    <lastmod>${now}</lastmod>
  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, 'sitemap.xml'), xml, 'utf8');

// eslint-disable-next-line no-console
console.log(`Wrote sitemap with ${staticPaths.length} URLs`);
