import { Link } from 'react-router-dom';
import { getPostBySlug } from '@/content/blog';
import { getTool } from '@/features/tools/registry';

type Props = {
  postSlugs: string[];
  toolSlugs: string[];
  title?: string;
  intro?: string;
};

/**
 * Existing articles and calculators that pair with a course or chapter.
 * Slugs are resolved at render time, so a renamed post shows up as a missing
 * link in review rather than a broken href in production.
 */
export function RelatedResources({
  postSlugs,
  toolSlugs,
  title = 'Recommended reading',
  intro,
}: Props) {
  const posts = postSlugs.map(getPostBySlug).filter((p): p is NonNullable<typeof p> => !!p);
  const tools = toolSlugs
    .map(getTool)
    .filter((t): t is NonNullable<typeof t> => !!t && t.status === 'live');

  if (posts.length === 0 && tools.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-teal-dark">{title}</h2>
      {intro ? <p className="mt-1 text-sm text-ink/70">{intro}</p> : null}

      {posts.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link to={`/blog/${p.slug}`} className="group block no-underline">
                <span className="font-medium text-teal-dark group-hover:underline">{p.title}</span>
                <span className="mt-0.5 block text-sm text-ink/70">{p.excerpt}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {tools.length > 0 ? (
        <>
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
            Calculators to run alongside
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tools.map((t) => (
              <li key={t.slug}>
                <Link
                  to={`/tools/${t.slug}`}
                  className="inline-flex rounded-full border border-teal/40 px-3 py-1 text-sm text-teal-dark no-underline transition-colors hover:bg-teal/5"
                >
                  {t.shortName ?? t.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
