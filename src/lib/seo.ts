// Centralized SEO constants. Origin is the only place the production URL is
// hardcoded — change it here if the canonical domain ever moves.
export const SITE_ORIGIN = 'https://theantfund.com';
export const SITE_NAME = 'The Ant Fund';
export const SITE_DEFAULT_DESCRIPTION =
  'Slow, steady wealth for everyday investors — calculators, education, and clear thinking on the road to financial independence.';
export const SITE_DEFAULT_OG_IMAGE = '/og-default.png';

export function absoluteUrl(path: string): string {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${trimmed}`;
}
