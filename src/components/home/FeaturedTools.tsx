import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { TOOLS, type ToolDef } from '@/features/tools/registry';

export function FeaturedTools() {
  return (
    <section id="tools">
      <Container className="py-20">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
            Financial tools
          </p>
          <h2 className="font-heading text-3xl font-semibold text-teal-dark sm:text-4xl">
            Calculators that show their work.
          </h2>
          <p className="mt-4 text-ink/80">
            Each tool is fully client-side — your inputs never leave your browser
            — and built to answer one question well.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <FeaturedToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeaturedToolCard({ tool }: { tool: ToolDef }) {
  const isLive = tool.status === 'live';
  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        {isLive ? (
          <Badge tone="amber">Available now</Badge>
        ) : (
          <Badge tone="neutral">Coming soon</Badge>
        )}
      </div>
      <h3 className="font-heading text-xl text-teal-dark">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm text-ink/80">{tool.description}</p>
      {isLive ? (
        <div className="mt-5">
          <LinkButton to={`/tools/${tool.slug}`} variant="secondary" size="md">
            Open tool
          </LinkButton>
        </div>
      ) : (
        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-ink/50">
          In development
        </p>
      )}
    </Card>
  );
}
