import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { getTool } from '@/features/tools/registry';

// Dynamic dispatcher for /tools/:slug. Looks the tool up in the registry and
// renders its lazy Page component inside a Suspense boundary so unknown or
// not-yet-live slugs bounce back to /tools instead of erroring.
export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getTool(slug) : undefined;

  if (!tool || tool.status !== 'live' || !tool.Page) {
    return <Navigate to="/tools" replace />;
  }

  const { Page } = tool;
  return (
    <Suspense fallback={<ToolPageFallback />}>
      <Page />
    </Suspense>
  );
}

function ToolPageFallback() {
  return (
    <Container className="py-24">
      <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/60">
        Loading tool…
      </div>
    </Container>
  );
}
