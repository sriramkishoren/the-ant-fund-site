import { useEffect, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StrategyBuilder } from '@/components/strategy-builder/StrategyBuilder';
import { getTool } from '@/features/tools/registry';

const TOOL = getTool('strategy-builder');

export default function StrategyBuilderPage() {
  // Held until after mount: it pulls in Recharts, reads the stored currency,
  // and may restore a position from the URL or localStorage.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const name = TOOL?.name ?? 'Options Strategy Builder';

  return (
    <>
      <Seo
        title={name}
        description="Build multi-leg option strategies — spreads, condors, straddles, calendars — and see profit and loss at every price and every date between now and expiry, with Greeks, breakevens and a payoff chart. Free and entirely client-side."
        path="/tools/strategy-builder"
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs className="mb-6" items={[{ label: 'Tools', to: '/tools' }, { label: name }]} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">Options</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 text-base text-ink/75">
            Combine any number of legs — calls, puts and stock — and see what the position is worth
            at every price <em>and</em> every date between today and expiry, not just at
            expiration. Greeks, breakevens and probability included. Your numbers never leave your
            device.
          </p>
        </header>

        <div className="mt-10">
          {mounted ? (
            <StrategyBuilder />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/60">
              Loading builder…
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
