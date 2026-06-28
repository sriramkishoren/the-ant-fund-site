import type { TocEntry } from '@/content/blog/toc';

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-lg border border-border bg-cream/60 p-5"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
        On this page
      </p>
      <ol className="space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={entry.level === 3 ? 'ml-4' : ''}
          >
            <a
              href={`#${entry.id}`}
              className="text-ink/80 no-underline hover:text-teal-dark hover:underline"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
