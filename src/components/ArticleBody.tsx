import { Link } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { ComponentProps } from 'react';
import { withBase } from '@/lib/basePath';

// Shared Markdown rendering for long-form content (blog posts and course
// chapters), so both stay typographically identical.
//
// - Internal links (relative or starting with "/") become React Router <Link>s
//   so navigation stays SPA-internal — no full page reload on click.
// - External links keep the bare <a> and get a safe target/rel.
// - Images run their src through withBase() so they resolve under any deploy
//   base path (root, /theantfund/, etc.).

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
  // Wide tables scroll within their own box rather than stretching the page
  // on a phone.
  table({ node: _node, ...rest }: WithNode<ComponentProps<'table'>>) {
    return (
      <div className="overflow-x-auto">
        <table {...rest} />
      </div>
    );
  },
  img({ src, alt, node: _node, ...rest }: WithNode<ComponentProps<'img'>>) {
    if (typeof src !== 'string' || !src) return null;
    const resolved = isExternal(src) ? src : withBase(src.replace(/^\//, ''));
    return <img src={resolved} alt={alt ?? ''} loading="lazy" {...rest} />;
  },
};

// Blockquotes are used as callouts throughout the site ("Important:", "A note
// on what this is", TL;DR), so they are styled as callouts: upright text, no
// automatic curly quotes, a teal rule and a light wash. Typography's default
// would render a risk warning as an italic quotation, as if someone had said it,
// and doubles the quote marks on the few genuine quotes that carry their own.
const calloutClass = [
  'prose-blockquote:not-italic',
  'prose-blockquote:font-normal',
  'prose-blockquote:text-ink/90',
  'prose-blockquote:border-l-teal',
  'prose-blockquote:bg-teal/5',
  'prose-blockquote:rounded-r-lg',
  'prose-blockquote:py-3',
  'prose-blockquote:pr-4',
  '[&_blockquote_p]:before:content-none',
  '[&_blockquote_p]:after:content-none',
  '[&_blockquote>:first-child]:mt-0',
  '[&_blockquote>:last-child]:mb-0',
].join(' ');

const proseClass = `prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-teal-dark prose-a:text-teal prose-strong:text-ink prose-code:text-teal-dark prose-code:before:content-none prose-code:after:content-none prose-pre:bg-surface prose-pre:text-teal-dark prose-pre:border prose-pre:border-border prose-pre:shadow-sm ${calloutClass}`;

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: 'no-underline' } }],
        ]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
