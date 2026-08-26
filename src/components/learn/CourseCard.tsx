import { Link } from 'react-router-dom';
import type { Course } from '@/content/learn/types';

type Props = {
  course: Course;
  chapterCount: number;
};

export function CourseCard({ course, chapterCount }: Props) {
  return (
    <li>
      <Link
        to={`/learn/${course.slug}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-teal-dark">
            {course.level}
          </span>
          <span className="text-xs text-ink/55">
            {chapterCount === 0
              ? 'Starting soon'
              : `${chapterCount} chapter${chapterCount === 1 ? '' : 's'}`}
          </span>
        </div>
        <h3 className="font-heading text-xl font-semibold text-teal-dark">{course.title}</h3>
        <p className="mt-1 text-sm text-ink/70">{course.subtitle}</p>
        <p className="mt-3 flex-1 text-sm text-ink/75">{course.description}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-teal-dark group-hover:underline">
          View course <span aria-hidden="true">→</span>
        </span>
      </Link>
    </li>
  );
}
