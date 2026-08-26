import { Link } from 'react-router-dom';
import type { Chapter } from '@/content/learn/types';

type Props = {
  courseSlug: string;
  chapters: Chapter[];
};

export function ChapterList({ courseSlug, chapters }: Props) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-cream/50 p-8 text-center">
        <p className="font-heading text-lg text-teal-dark">Chapters are on their way</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink/70">
          Each chapter is published here once it&rsquo;s written up, so this list grows as the
          course runs. The reading below is a good place to start in the meantime.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {chapters.map((c, i) => (
        <li key={c.slug}>
          <Link
            to={`/learn/${courseSlug}/${c.slug}`}
            className="group flex gap-4 rounded-xl border border-border bg-surface p-5 no-underline shadow-sm transition-all hover:border-teal/40 hover:shadow-md"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 font-heading text-sm font-semibold text-teal-dark"
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-semibold text-teal-dark group-hover:underline">
                {c.title}
              </span>
              <span className="mt-1 block text-sm text-ink/75">{c.excerpt}</span>
              <span className="mt-2 block text-xs text-ink/55">{c.readingTime} min read</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
