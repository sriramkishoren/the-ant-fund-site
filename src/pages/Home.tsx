import { Seo } from '@/components/Seo';
import { Hero } from '@/components/home/Hero';
import { Mission } from '@/components/home/Mission';
import { FeaturedTools } from '@/components/home/FeaturedTools';
import { Benefits } from '@/components/home/Benefits';
import { LatestArticles } from '@/components/home/LatestArticles';
import { Testimonials } from '@/components/home/Testimonials';
import { Newsletter } from '@/components/home/Newsletter';
import { ClosingCTA } from '@/components/home/ClosingCTA';
import { SITE_NAME, SITE_ORIGIN } from '@/lib/seo';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon-512.png`,
  description:
    'The Ant Fund publishes calculators and educational content for everyday investors pursuing financial independence.',
};

export default function Home() {
  return (
    <>
      <Seo
        title={SITE_NAME}
        description="Slow, steady wealth for everyday investors. Free Monte Carlo retirement calculator, plain-language essays, and clear thinking on the road to financial independence."
        path="/"
        jsonLd={organizationJsonLd}
      />
      <Hero />
      <Mission />
      <FeaturedTools />
      <Benefits />
      <LatestArticles />
      <Testimonials />
      <Newsletter />
      <ClosingCTA />
    </>
  );
}
