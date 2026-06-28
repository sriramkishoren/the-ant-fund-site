import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import type { BlogPost } from '@/content/blog';
import { withBase } from '@/lib/basePath';
import { parsePostDate } from '@/lib/date';

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-cream/50 transition-shadow hover:shadow-md">
      <Link
        to={`/blog/${post.slug}`}
        aria-label={post.title}
        className="block aspect-[16/9] overflow-hidden bg-gradient-to-br from-teal/15 via-cream to-gold/20 no-underline"
      >
        {post.featuredImage ? (
          <img
            src={withBase(post.featuredImage.replace(/^\//, ''))}
            alt={post.featuredImageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-ink/60">
          <Badge tone="teal">{post.category}</Badge>
          <span aria-hidden>·</span>
          <time dateTime={post.date}>{dateFmt.format(parsePostDate(post.date))}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime} min</span>
        </div>
        <h3 className="font-heading text-lg leading-snug">
          <Link
            to={`/blog/${post.slug}`}
            className="text-teal-dark no-underline group-hover:underline"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-ink/80">{post.excerpt}</p>
      </div>
    </article>
  );
}
