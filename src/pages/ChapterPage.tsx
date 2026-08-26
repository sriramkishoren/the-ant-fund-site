import { Link, useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArticleBody } from '@/components/ArticleBody';
import { AgendaList } from '@/components/learn/AgendaList';
import { ChapterNav } from '@/components/learn/ChapterNav';
import { RelatedResources } from '@/components/learn/RelatedResources';
import {
  getAdjacentChapters,
  getChapter,
  getChaptersForCourse,
  getCourseBySlug,
} from '@/content/learn';
import { parsePostDate } from '@/lib/date';
import { SITE_NAME, SITE_ORIGIN } from '@/lib/seo';
import NotFound from './NotFound';

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function ChapterPage() {
  const { course: courseSlug = '', chapter: chapterSlug = '' } = useParams<{
    course: string;
    chapter: string;
  }>();

  const course = getCourseBySlug(courseSlug);
  const chapter = course ? getChapter(courseSlug, chapterSlug) : undefined;
  if (!course || !chapter) return <NotFound />;

  const all = getChaptersForCourse(course.slug);
  const position = all.findIndex((c) => c.slug === chapter.slug) + 1;
  const { prev, next } = getAdjacentChapters(course.slug, chapter.slug);
  const path = `/learn/${course.slug}/${chapter.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    description: chapter.description ?? chapter.excerpt,
    datePublished: chapter.date,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
    mainEntityOfPage: `${SITE_ORIGIN}${path}`,
    isPartOf: {
      '@type': 'Course',
      name: course.title,
      url: `${SITE_ORIGIN}/learn/${course.slug}`,
    },
  };

  return (
    <>
      <Seo
        title={chapter.title}
        description={chapter.description ?? chapter.excerpt}
        path={path}
        jsonLd={jsonLd}
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Learn', to: '/learn' },
            { label: course.title, to: `/learn/${course.slug}` },
            { label: chapter.title },
          ]}
        />

        <article className="mx-auto max-w-3xl">
          <header>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
              {course.title} · Chapter {position}
              {all.length > 1 ? ` of ${all.length}` : ''}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight text-teal-dark sm:text-4xl">
              {chapter.title}
            </h1>
            <p className="mt-3 text-base text-ink/75">{chapter.excerpt}</p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink/55">
              <time dateTime={chapter.date}>{dateFmt.format(parsePostDate(chapter.date))}</time>
              <span aria-hidden="true">·</span>
              <span>{chapter.readingTime} min read</span>
            </p>
          </header>

          {chapter.agenda.length > 0 ? (
            <div className="mt-8">
              <AgendaList items={chapter.agenda} title="In this chapter" dense />
            </div>
          ) : null}

          <div className="mt-8">
            <ArticleBody content={chapter.content} />
          </div>

          <aside
            role="note"
            className="mt-10 rounded-lg border border-border bg-cream/60 p-5 text-sm text-ink/80"
          >
            <span className="font-medium text-teal-dark">Educational only, not financial advice.</span>{' '}
            This chapter explains how something works. It is not a recommendation to buy or sell
            anything, and any prices or figures are illustrative teaching examples, not live quotes.
          </aside>

          <div className="mt-10 space-y-8">
            <ChapterNav courseSlug={course.slug} prev={prev} next={next} />

            <RelatedResources
              postSlugs={chapter.relatedPosts}
              toolSlugs={chapter.relatedTools}
              title="Go deeper"
            />

            <p className="text-center text-sm text-ink/60">
              <Link to={`/learn/${course.slug}`} className="text-teal underline-offset-2 hover:underline">
                ← All chapters in {course.title}
              </Link>
            </p>
          </div>
        </article>
      </Container>
    </>
  );
}
