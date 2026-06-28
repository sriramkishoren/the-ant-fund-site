import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import type { BlogPost } from '@/content/blog';

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="font-heading text-2xl font-semibold text-teal-dark"
      >
        Related reading
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border border-border bg-cream/40 p-5"
          >
            <Badge tone="teal">{post.category}</Badge>
            <h3 className="mt-3 font-heading text-base leading-snug">
              <Link
                to={`/blog/${post.slug}`}
                className="text-teal-dark no-underline hover:underline"
              >
                {post.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-ink/80">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
