import type { ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/ui/Badge';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareLinks } from '@/components/blog/ShareLinks';
import { PrevNext } from '@/components/blog/PrevNext';
import { RelatedPosts } from '@/components/blog/RelatedPosts';

import {
  getPostBySlug,
  getAdjacentPosts,
  getRelatedPosts,
} from '@/content/blog';
import { extractToc } from '@/content/blog/toc';
import { withBase } from '@/lib/basePath';
import { parsePostDate } from '@/lib/date';
import { SITE_NAME, SITE_ORIGIN, absoluteUrl } from '@/lib/seo';
import NotFound from './NotFound';

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Custom renderers for the Markdown body:
// - Internal links (relative or starting with "/") become React Router <Link>s
//   so navigation stays SPA-internal — no full page reload on click.
// - External links keep the bare <a> and get a safe target/rel.
// - Images run their src through withBase() so they resolve correctly under
//   any deploy base path (root, /theantfund/, etc.).
function isExternal(href: string): boolean {
  return /^([a-z]+:)?\/\//i.test(href) || href.startsWith('mailto:');
}

// react-markdown injects a `node` prop into custom components; strip it so it
// doesn't leak into the rendered HTML as `node="[object Object]"`.
type WithNode<T> = T & { node?: unknown };

const markdownComponents: Components = {
  a({ href, children, node: _node, ...rest }: WithNode<ComponentProps<'a'>>) {
    if (!href) return <a {...rest}>{children}</a>;
    if (isExternal(href) || href.startsWith('#')) {
      return (
        <a
          href={href}
          target={isExternal(href) ? '_blank' : undefined}
          rel={isExternal(href) ? 'noopener noreferrer' : undefined}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  },
  img({ src, alt, node: _node, ...rest }: WithNode<ComponentProps<'img'>>) {
    if (typeof src !== 'string' || !src) return null;
    const resolved = isExternal(src) ? src : withBase(src.replace(/^\//, ''));
    return <img src={resolved} alt={alt ?? ''} loading="lazy" {...rest} />;
  },
};

export default function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);

  if (!post) {
    return <NotFound />;
  }

  const path = `/blog/${post.slug}`;
  const { prev, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug, 3);
  const toc = extractToc(post.content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description ?? post.excerpt,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/favicon-512.png`,
      },
    },
    datePublished: post.date,
    image: post.featuredImage.startsWith('http')
      ? post.featuredImage
      : absoluteUrl(post.featuredImage),
    mainEntityOfPage: absoluteUrl(path),
  };

  return (
    <>
      <Seo
        title={post.title}
        description={post.description ?? post.excerpt}
        path={path}
        image={post.featuredImage}
        type="article"
        publishedTime={post.date}
        author={post.author}
        jsonLd={articleJsonLd}
      />

      <article>
        <Container className="pt-16 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
            <a href={withBase('blog')} className="no-underline hover:underline">
              Blog
            </a>{' '}
            / {post.category}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/80">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink/70">
            <Badge tone="teal">{post.category}</Badge>
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.date}>{dateFmt.format(parsePostDate(post.date))}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </Container>

        {post.featuredImage ? (
          <Container className="pb-8">
            <img
              src={withBase(post.featuredImage.replace(/^\//, ''))}
              alt={post.featuredImageAlt}
              className="aspect-[16/9] w-full rounded-xl border border-border object-cover"
              loading="eager"
              decoding="async"
            />
          </Container>
        ) : null}

        <Container className="grid gap-10 pb-16 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TableOfContents entries={toc} />
          </aside>

          <div>
            <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-teal-dark prose-a:text-teal prose-strong:text-ink prose-code:text-teal-dark prose-code:before:content-none prose-code:after:content-none prose-pre:bg-surface prose-pre:text-teal-dark prose-pre:border prose-pre:border-border prose-pre:shadow-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: 'wrap',
                      properties: { className: 'no-underline' },
                    },
                  ],
                ]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <aside
              role="note"
              className="mt-10 rounded-lg border border-border bg-cream/60 p-5 text-sm text-ink/80"
            >
              <strong className="text-teal-dark">A note on what this is.</strong>{' '}
              The Ant Fund publishes educational content for informational
              purposes only. Nothing here is financial, investment, tax, or legal
              advice.
            </aside>

            <div className="mt-10 border-t border-border pt-6">
              <ShareLinks path={path} title={post.title} />
            </div>
          </div>
        </Container>

        <Container className="space-y-12 pb-24">
          <PrevNext prev={prev} next={next} />
          <RelatedPosts posts={related} />
        </Container>
      </article>
    </>
  );
}
