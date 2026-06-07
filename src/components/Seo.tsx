import { Head } from 'vite-react-ssg';
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
} from '@/lib/seo';

type SeoProps = {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown>;
};

export function Seo({
  title,
  description = SITE_DEFAULT_DESCRIPTION,
  path,
  image = SITE_DEFAULT_OG_IMAGE,
  type = 'website',
  publishedTime,
  author,
  jsonLd,
}: SeoProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const ogImage = image.startsWith('http') ? image : absoluteUrl(image);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {author ? <meta property="article:author" content={author} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Head>
  );
}
