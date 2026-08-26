/** A course: an ordered track of chapters, published organically as each is written. */
export interface Course {
  slug: string;
  title: string;
  /** One line under the title on cards and the course header. */
  subtitle: string;
  /** Two or three sentences: what this course is and who it's for. */
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  /** Course-level agenda — the arc of the whole track. */
  agenda: string[];
  /** Concrete things a reader should be able to do afterwards. */
  outcomes: string[];
  /** Existing articles worth reading alongside the course. */
  relatedPosts: string[];
  /** Calculators that pair with this material. */
  relatedTools: string[];
  /** Ordering on the /learn hub. */
  order: number;
}

/** One chapter within a course. */
export interface Chapter {
  slug: string;
  courseSlug: string;
  order: number;
  title: string;
  excerpt: string;
  description?: string;
  /** Chapter-level agenda — what this single chapter covers. */
  agenda: string[];
  /** ISO date the chapter was published. */
  date: string;
  readingTime: number;
  relatedPosts: string[];
  relatedTools: string[];
  content: string;
}
