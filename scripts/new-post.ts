// Scaffolds a new blog post Markdown file from src/content/blog/_templates.
// Usage:
//   npm run new-post -- "My Post Title"
//   npm run new-post -- "X vs Y: Which Wins?" --template=comparison
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATES_DIR = resolve(ROOT, 'src', 'content', 'blog', '_templates');
const POSTS_DIR = resolve(ROOT, 'src', 'content', 'blog', 'posts');

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv: string[]): { title: string; template: string } {
  const args = argv.slice(2);
  let template = 'standard';
  const positional: string[] = [];

  for (const a of args) {
    if (a.startsWith('--template=')) {
      template = a.split('=')[1] ?? 'standard';
    } else if (a === '--template') {
      // handled by next iteration via lookahead — but simpler to accept --template=name only
      template = 'standard';
    } else {
      positional.push(a);
    }
  }

  const title = positional.join(' ').trim();
  return { title, template };
}

function listTemplates(): string[] {
  if (!existsSync(TEMPLATES_DIR)) return [];
  return readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

function main(): void {
  const { title, template } = parseArgs(process.argv);

  if (!title) {
    const available = listTemplates().join(', ') || 'standard';
    // eslint-disable-next-line no-console
    console.error(
      `Usage: npm run new-post -- "Post Title" [--template=${available}]`,
    );
    process.exit(1);
  }

  const templatePath = resolve(TEMPLATES_DIR, `${template}.md`);
  if (!existsSync(templatePath)) {
    // eslint-disable-next-line no-console
    console.error(
      `Template "${template}" not found. Available: ${listTemplates().join(', ')}`,
    );
    process.exit(1);
  }

  const slug = slugify(title);
  const outPath = resolve(POSTS_DIR, `${slug}.md`);

  if (existsSync(outPath)) {
    // eslint-disable-next-line no-console
    console.error(`Refusing to overwrite existing post: ${outPath}`);
    process.exit(1);
  }

  const source = readFileSync(templatePath, 'utf8');

  // Replace the placeholder title + date in the frontmatter. We only touch the
  // first occurrence of each so the body's REPLACE markers stay intact for the
  // author to fill in.
  let next = source.replace(
    /title:\s*".*?"/,
    `title: "${title.replace(/"/g, '\\"')}"`,
  );
  next = next.replace(/date:\s*"YYYY-MM-DD"/, `date: "${today()}"`);

  writeFileSync(outPath, next, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Created ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`URL preview: /blog/${slug}`);
}

main();
