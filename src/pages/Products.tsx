import { lazy, Suspense, useEffect, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';

// Lazy-load the calculator (and Recharts) only on the client + only when this
// route is visited. The page still pre-renders cleanly because the fallback
// renders during SSG and the real component mounts after hydration.
const Calculator = lazy(() =>
  import('@/components/calculator/Calculator').then((m) => ({ default: m.Calculator })),
);

export default function Products() {
  // Don't render the worker-driven calculator during SSG. We mount it after
  // hydration so the static HTML stays clean and Recharts/worker code never
  // runs server-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Seo
        title="Tools"
        description="Free, fully client-side calculators for retirement planning, financial independence, and long-term investing — including a Monte Carlo retirement simulator."
        path="/products"
      />
      <Container className="py-12 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
            Tools
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            Monte Carlo retirement calculator
          </h1>
          <p className="mt-4 text-base text-ink/75">
            Run 10,000 simulations of your retirement plan in your browser. See how often the
            plan survives, what the bad cases look like, and where the assumptions matter most.
          </p>
        </header>

        <div className="mt-10">
          {mounted ? (
            <Suspense fallback={<CalculatorFallback />}>
              <Calculator />
            </Suspense>
          ) : (
            <CalculatorFallback />
          )}
        </div>

        <FutureProducts />
      </Container>
    </>
  );
}

function CalculatorFallback() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/60">
      Loading calculator…
    </div>
  );
}

const TEASERS: { title: string; description: string }[] = [
  {
    title: 'FIRE number',
    description: 'Size the portfolio that turns work optional. Coming soon.',
  },
  {
    title: 'Safe withdrawal planner',
    description: 'Model dynamic withdrawal strategies side by side. Coming soon.',
  },
  {
    title: 'SIP / DCA planner',
    description: 'Project a systematic investment plan with adjustable contributions. Coming soon.',
  },
  {
    title: 'Net-worth tracker',
    description: 'A no-account, local-only way to log net worth over time. Coming soon.',
  },
  {
    title: 'Rental property ROI',
    description: 'Cash-on-cash, cap rate, and long-run return on a rental. Coming soon.',
  },
];

function FutureProducts() {
  return (
    <section className="mt-20">
      <header className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-2xl font-semibold text-teal-dark sm:text-3xl">
          Coming next
        </h2>
        <p className="mt-3 text-sm text-ink/70">
          The Monte Carlo simulator is the first tool. The rest of the toolkit is on the way.
        </p>
      </header>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEASERS.map((t) => (
          <li
            key={t.title}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm opacity-80"
          >
            <h3 className="font-heading text-lg font-semibold text-teal-dark">{t.title}</h3>
            <p className="mt-1 text-sm text-ink/70">{t.description}</p>
            <span className="mt-3 inline-block rounded-full bg-cream px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-amber">
              Soon
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
