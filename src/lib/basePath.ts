// Prefix a path with Vite's configured base URL so internal links and asset
// references work whether the site is served from a custom domain root or a
// GitHub Pages subpath. Use this anywhere a URL is built as a string.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${trimmed}`;
}
