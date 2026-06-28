export interface BlogPost {
  title: string;
  slug: string;
  author: string;
  date: string; // ISO 8601, e.g. "2026-05-12"
  category: string;
  tags: string[];
  excerpt: string; // 1–2 sentence card summary; default fallback for meta description
  description?: string; // optional override for <meta name="description">
  featuredImage: string; // path under /public; pass through withBase() at render time
  featuredImageAlt: string;
  readingTime: number; // minutes; computed from content when omitted in frontmatter
  content: string; // Markdown body
}

export interface BlogFrontmatter {
  title: string;
  slug?: string;
  author?: string;
  date: string;
  category: string;
  tags?: string[];
  excerpt: string;
  description?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  readingTime?: number;
}
