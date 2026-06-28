import { Link } from 'react-router-dom';
import type { BlogPost } from '@/content/blog';

export function PrevNext({
  prev,
  next,
}: {
  prev: BlogPost | null;
  next: BlogPost | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="Previous and next article" className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          to={`/blog/${prev.slug}`}
          className="rounded-lg border border-border bg-cream/40 p-5 no-underline transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
            ← Older
          </p>
          <p className="mt-2 font-heading text-base text-teal-dark">{prev.title}</p>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={`/blog/${next.slug}`}
          className="rounded-lg border border-border bg-cream/40 p-5 text-right no-underline transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
            Newer →
          </p>
          <p className="mt-2 font-heading text-base text-teal-dark">{next.title}</p>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
