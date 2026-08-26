import { Link } from 'react-router-dom';
import type { Chapter } from '@/content/learn/types';

type Props = {
  courseSlug: string;
  prev: Chapter | null;
  next: Chapter | null;
};

/** Previous/next navigation within a course. */
export function ChapterNav({ courseSlug, prev, next }: Props) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Chapter navigation" className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          to={`/learn/${courseSlug}/${prev.slug}`}
          className="rounded-xl border border-border bg-surface p-4 no-underline shadow-sm transition-colors hover:border-teal/40"
        >
          <span className="block text-xs uppercase tracking-wide text-ink/55">← Previous</span>
          <span className="mt-1 block font-medium text-teal-dark">{prev.title}</span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
      {next ? (
        <Link
          to={`/learn/${courseSlug}/${next.slug}`}
          className="rounded-xl border border-border bg-surface p-4 text-right no-underline shadow-sm transition-colors hover:border-teal/40 sm:col-start-2"
        >
          <span className="block text-xs uppercase tracking-wide text-ink/55">Next →</span>
          <span className="mt-1 block font-medium text-teal-dark">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
