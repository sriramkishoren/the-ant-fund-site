import { useEffect, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { BucketPlanner } from '@/components/bucket-strategy/BucketPlanner';
import { getTool } from '@/features/tools/registry';

const TOOL = getTool('bucket-strategy-planner');

export default function BucketStrategyPlannerPage() {
  // Gate the interactive planner until after mount — it pulls in Recharts and a
  // Web Worker, both of which prefer not to run during static pre-rendering.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const name = TOOL?.name ?? 'Bucket Strategy Planner';

  return (
    <>
      <Seo
        title={name}
        description="Two-bucket retirement strategy calculator: a stability bucket funds spending, a growth bucket refills it under guardrail rules. Monte Carlo success rates plus a January-2000 dot-com stress test. Free and fully client-side."
        path="/tools/bucket-strategy-planner"
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs className="mb-6" items={[{ label: 'Tools', to: '/tools' }, { label: name }]} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">Retirement</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 text-base text-ink/75">
            A retirement bucket strategy models the <em>maintenance rules</em>, not just a static
            withdrawal rate: a stability bucket funds your spending, a growth bucket refills it after
            good years, and guardrails trim spending when markets turn. See how it holds up across
            thousands of futures — and against the real January-2000 sequence. Your numbers never
            leave your device.
          </p>
        </header>

        <div className="mt-10">
          {mounted ? (
            <BucketPlanner />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/60">
              Loading planner…
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
