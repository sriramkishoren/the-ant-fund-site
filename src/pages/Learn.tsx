import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { CourseCard } from '@/components/learn/CourseCard';
import { getAllCourses, getChapterCount } from '@/content/learn';
import { SITE_ORIGIN } from '@/lib/seo';

export default function Learn() {
  const courses = getAllCourses();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Courses',
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      url: `${SITE_ORIGIN}/learn/${c.slug}`,
    })),
  };

  return (
    <>
      <Seo
        title="Learn"
        description="Structured courses on options trading and retirement planning — written up chapter by chapter, in plain English, with calculators to run on your own numbers."
        path="/learn"
        jsonLd={jsonLd}
      />
      <Container className="py-12 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">Learn</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            Courses, one chapter at a time.
          </h1>
          <p className="mt-4 text-base text-ink/75">
            Longer tracks that build in order, rather than standalone essays. Each chapter is
            published once it&rsquo;s written up, so a course grows as it runs — and every one
            pairs with calculators you can run on your own numbers.
          </p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              chapterCount={getChapterCount(course.slug)}
            />
          ))}
        </ul>
      </Container>
    </>
  );
}
