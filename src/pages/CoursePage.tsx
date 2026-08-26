import { useParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AgendaList } from '@/components/learn/AgendaList';
import { ChapterList } from '@/components/learn/ChapterList';
import { RelatedResources } from '@/components/learn/RelatedResources';
import { getCourseBySlug, getChaptersForCourse } from '@/content/learn';
import { SITE_NAME, SITE_ORIGIN } from '@/lib/seo';
import NotFound from './NotFound';

export default function CoursePage() {
  const { course: courseSlug = '' } = useParams<{ course: string }>();
  const course = getCourseBySlug(courseSlug);
  if (!course) return <NotFound />;

  const chapters = getChaptersForCourse(course.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${SITE_ORIGIN}/learn/${course.slug}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
    educationalLevel: course.level,
    isAccessibleForFree: true,
    ...(chapters.length > 0
      ? {
          hasPart: chapters.map((c) => ({
            '@type': 'CreativeWork',
            name: c.title,
            url: `${SITE_ORIGIN}/learn/${course.slug}/${c.slug}`,
          })),
        }
      : {}),
  };

  return (
    <>
      <Seo
        title={course.title}
        description={course.description}
        path={`/learn/${course.slug}`}
        jsonLd={jsonLd}
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: 'Learn', to: '/learn' }, { label: course.title }]}
        />

        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
            {course.level} course
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-3 text-lg text-ink/70">{course.subtitle}</p>
          <p className="mt-4 text-base text-ink/75">{course.description}</p>
        </header>

        <div className="mx-auto mt-10 max-w-3xl space-y-8">
          <AgendaList items={course.agenda} title="Course agenda" />

          {course.outcomes.length > 0 ? (
            <section className="rounded-xl border border-teal/30 bg-teal/5 p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold text-teal-dark">
                By the end, you should be able to
              </h2>
              <ul className="mt-3 space-y-2">
                {course.outcomes.map((o, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/85">
                    <span aria-hidden="true" className="font-semibold text-teal">
                      ✓
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="font-heading text-2xl font-semibold text-teal-dark">
              Chapters
              {chapters.length > 0 ? (
                <span className="ml-2 text-base font-normal text-ink/55">
                  {chapters.length} published
                </span>
              ) : null}
            </h2>
            <div className="mt-4">
              <ChapterList courseSlug={course.slug} chapters={chapters} />
            </div>
          </section>

          <RelatedResources
            postSlugs={course.relatedPosts}
            toolSlugs={course.relatedTools}
            intro="Written guides and calculators that cover this ground already."
          />

          <div className="rounded-md border border-border bg-cream/50 px-4 py-3 text-xs leading-relaxed text-ink/70">
            <span className="font-medium text-teal-dark">Educational only, not financial advice.</span>{' '}
            These write-ups explain how instruments and strategies work. Nothing here is a
            recommendation to buy or sell anything, and any figures are illustrative teaching
            examples rather than live quotes.
          </div>
        </div>
      </Container>
    </>
  );
}
