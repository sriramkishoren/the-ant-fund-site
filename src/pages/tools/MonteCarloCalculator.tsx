import { useEffect, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Calculator } from '@/components/calculator/Calculator';
import { getTool } from '@/features/tools/registry';

const TOOL = getTool('monte-carlo-retirement-calculator');

export default function MonteCarloCalculator() {
  // Hold the Calculator off until the client mounts. The Calculator pulls in
  // Recharts and a Web Worker, both of which prefer not to run during SSG. A
  // simple gate keeps the static HTML deterministic and avoids hydration drift.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const name = TOOL?.name ?? 'Monte Carlo Retirement Calculator';
  const description =
    TOOL?.description ??
    'Run 10,000 simulations of your retirement plan in your browser.';

  return (
    <>
      <Seo
        title={name}
        description={description}
        path="/tools/monte-carlo-retirement-calculator"
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Tools', to: '/tools' },
            { label: name },
          ]}
        />
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
            Retirement
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 text-base text-ink/75">{description}</p>
        </header>

        <div className="mt-10">
          {mounted ? (
            <Calculator />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/60">
              Loading calculator…
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
