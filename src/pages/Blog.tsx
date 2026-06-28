import { useMemo, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/Button';
import { getAllPosts, getCategories } from '@/content/blog';

const POSTS_PER_PAGE = 9;
type SortOrder = 'newest' | 'oldest';

export default function Blog() {
  const allPosts = useMemo(() => getAllPosts(), []);
  const categories = useMemo(() => getCategories(), []);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = allPosts;

    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // `allPosts` is already newest-first. Reverse to flip to oldest-first.
    if (sort === 'oldest') {
      result = [...result].reverse();
    }
    return result;
  }, [allPosts, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE,
  );

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <>
      <Seo
        title="Blog"
        description="Plain-language essays on retirement, investing, Monte Carlo simulation, and the road to financial independence — written for everyday investors."
        path="/blog"
      />
      <Container className="pt-16 pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
          The Ant Fund blog
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
          Reading worth your time.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/80">
          Essays on retirement math, indexing, simulation, and what
          financial independence actually means — written without jargon, without
          advice-giving, and without rushing.
        </p>
      </Container>

      <Container className="pb-12">
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface p-4">
          <div className="min-w-[14rem] flex-1">
            <label
              htmlFor="blog-search"
              className="block text-xs font-medium text-ink/70"
            >
              Search
            </label>
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              placeholder="Title, body, or tag…"
              className="mt-1 w-full rounded-md border border-border bg-cream/40 px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="blog-category"
              className="block text-xs font-medium text-ink/70"
            >
              Category
            </label>
            <select
              id="blog-category"
              value={category}
              onChange={(e) => resetPage(setCategory)(e.target.value)}
              className="mt-1 rounded-md border border-border bg-cream/40 px-3 py-2 text-sm focus:border-teal focus:outline-none"
            >
              <option value="All">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="blog-sort"
              className="block text-xs font-medium text-ink/70"
            >
              Sort
            </label>
            <select
              id="blog-sort"
              value={sort}
              onChange={(e) =>
                resetPage(setSort)(e.target.value as SortOrder)
              }
              className="mt-1 rounded-md border border-border bg-cream/40 px-3 py-2 text-sm focus:border-teal focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink/60" aria-live="polite">
          {filtered.length} article{filtered.length === 1 ? '' : 's'}
          {category !== 'All' ? ` in ${category}` : ''}
          {query ? ` matching “${query}”` : ''}
        </p>
      </Container>

      <Container className="pb-20">
        {/* Visually-hidden heading so the card <h3>s have an <h2> ancestor and
            the document outline doesn't skip a level on the listing page. */}
        <h2 className="sr-only">All articles</h2>
        {paged.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-10 text-center text-ink/70">
            No articles match those filters yet. Try clearing search or category.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Button
              variant="ghost"
              size="md"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              ← Previous
            </Button>
            <span className="text-sm text-ink/70">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next →
            </Button>
          </nav>
        ) : null}
      </Container>
    </>
  );
}
