// Phase-0 stub. The page exists, the registry does NOT link to it yet — that
// flip happens in Phase 2 once the Beginner tier UI is real.

import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function FireCalculator() {
  return (
    <>
      <Seo
        title="FIRE Calculator"
        description="A layered hybrid FIRE-number calculator — coming soon."
        path="/tools/fire-calculator"
      />
      <Container className="py-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: 'Tools', to: '/tools' }, { label: 'FIRE Calculator' }]}
        />
        <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/65">
          FIRE calculator — under construction.
        </div>
      </Container>
    </>
  );
}
