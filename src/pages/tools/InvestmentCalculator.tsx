import { useEffect, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { InvestmentCalculator } from '@/components/investment-calculator/InvestmentCalculator';
import { getTool } from '@/features/tools/registry';

const TOOL = getTool('investment-calculator');

export default function InvestmentCalculatorPage() {
  // Gate the interactive calculator until after mount. It pulls in Recharts and
  // reads window-only APIs; keeping it out of SSG avoids hydration drift.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const name = TOOL?.name ?? 'Investment Calculator';
  const description =
    TOOL?.description ??
    'Project how an investment grows with contributions and compounding — and solve for the contribution, return, starting amount, or time you need.';

  return (
    <>
      <Seo title={name} description={description} path="/tools/investment-calculator" />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs className="mb-6" items={[{ label: 'Tools', to: '/tools' }, { label: name }]} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">Investing</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 text-base text-ink/75">
            See how contributions and compounding grow over time — or flip it around and solve for
            the contribution, return, starting amount, or number of years you need. Everything runs
            in your browser; your numbers never leave your device.
          </p>
        </header>

        <div className="mt-10">
          {mounted ? (
            <InvestmentCalculator />
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
