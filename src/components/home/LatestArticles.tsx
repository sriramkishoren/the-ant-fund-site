import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { getRecentPosts } from '@/content/blog';
import { parsePostDate } from '@/lib/date';

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function LatestArticles() {
  const posts = getRecentPosts(3);

  return (
    <section className="bg-surface border-y border-border">
      <Container className="py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
              From the blog
            </p>
            <h2 className="font-heading text-3xl font-semibold text-teal-dark sm:text-4xl">
              Reading worth your time.
            </h2>
          </div>
          <LinkButton to="/blog" variant="ghost" size="md">
            All articles →
          </LinkButton>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-cream/50 transition-shadow hover:shadow-md"
            >
              <Link
                to={`/blog/${post.slug}`}
                className="block aspect-[16/9] bg-gradient-to-br from-teal/15 via-cream to-gold/20 no-underline"
                aria-label={post.title}
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-ink/60">
                  <Badge tone="teal">{post.category}</Badge>
                  <span>·</span>
                  <time dateTime={post.date}>{dateFmt.format(parsePostDate(post.date))}</time>
                </div>
                <h3 className="font-heading text-lg leading-snug text-teal-dark">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="no-underline group-hover:underline"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm text-ink/80">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
