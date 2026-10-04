import { useEffect, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { OptionsCalculator } from '@/components/options-calculator/OptionsCalculator';
import { getTool } from '@/features/tools/registry';

const TOOL = getTool('options-calculator');

export default function OptionsCalculatorPage() {
  // Hold the calculator until after mount — it pulls in Recharts and reads
  // the stored currency, both of which prefer not to run during pre-rendering.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const name = TOOL?.name ?? 'Options Calculator';

  return (
    <>
      <Seo
        title={name}
        description="Work out breakeven, maximum profit and loss, and return for four single-leg option strategies — buying calls and puts, selling cash-secured puts and covered calls. Free, with a payoff chart, and entirely client-side."
        path="/tools/options-calculator"
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs className="mb-6" items={[{ label: 'Tools', to: '/tools' }, { label: name }]} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">Options</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 text-base text-ink/75">
            Pick a strategy, enter the contract, and see the breakeven, the most you can make, the
            most you can lose, and what the position is worth at any price — with the payoff drawn
            out. Your numbers never leave your device.
          </p>
        </header>

        <div className="mt-10">
          {mounted ? (
            <OptionsCalculator />
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
