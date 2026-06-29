import type { TocEntry } from '@/content/blog/toc';

// The container is capped at viewport-minus-header so long posts (40+ entries)
// don't overflow the screen. Scrolling stays inside the TOC; the article
// itself scrolls independently. Header offset must stay in sync with the
// sticky `top-24` (96px) applied to the surrounding aside.
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="toc-scroll flex max-h-[calc(100vh-7rem)] flex-col rounded-lg border border-border bg-cream/60"
    >
      <p className="px-4 pt-4 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-teal">
        On this page
      </p>
      <ol className="overflow-y-auto px-2 pb-3 text-[13px] leading-snug">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={
                entry.level === 3
                  ? 'block rounded px-2 py-1 pl-6 text-[12.5px] text-ink/65 no-underline transition-colors hover:bg-teal/10 hover:text-teal-dark'
                  : 'block rounded px-2 py-1 text-ink/85 no-underline transition-colors hover:bg-teal/10 hover:text-teal-dark'
              }
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
