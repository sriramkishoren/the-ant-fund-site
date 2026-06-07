export interface BlogPost {
  title: string;
  slug: string;
  author: string;
  date: string; // ISO 8601, e.g. "2026-05-12"
  category: string;
  excerpt: string;
  featuredImage: string;
  readingTime?: number;
  content: string;
}
