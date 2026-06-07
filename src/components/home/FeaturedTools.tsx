import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';

type Tool = {
  name: string;
  description: string;
  status: 'live' | 'soon';
  href?: string;
};

const tools: Tool[] = [
  {
    name: 'Monte Carlo Retirement Calculator',
    description:
      'Run 10,000 simulated futures of your portfolio. See survival probability, percentile outcomes, and the year-by-year path.',
    status: 'live',
    href: '/products',
  },
  {
    name: 'FIRE Calculator',
    description:
      'Translate your annual spending into a financial-independence target and the savings rate to get there.',
    status: 'soon',
  },
  {
    name: 'SWP Planner',
    description:
      'Model a systematic withdrawal plan: starting balance, draw rate, and how long it lasts across markets.',
    status: 'soon',
  },
  {
    name: 'SIP Calculator',
    description:
      'See what a recurring monthly investment grows to with realistic, variable returns over time.',
    status: 'soon',
  },
  {
    name: 'Net Worth Tracker',
    description:
      'Snapshot assets and liabilities, watch the line that matters most trend up over the years.',
    status: 'soon',
  },
  {
    name: 'Rental Property ROI',
    description:
      'Run the numbers on a rental — cash flow, cap rate, total return — before you put down earnest money.',
    status: 'soon',
  },
];

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
          {tools.map((tool) => (
            <Card key={tool.name} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                {tool.status === 'live' ? (
                  <Badge tone="amber">Available now</Badge>
                ) : (
                  <Badge tone="neutral">Coming soon</Badge>
                )}
              </div>
              <h3 className="font-heading text-xl text-teal-dark">{tool.name}</h3>
              <p className="mt-2 flex-1 text-sm text-ink/80">{tool.description}</p>
              {tool.status === 'live' && tool.href ? (
                <div className="mt-5">
                  <LinkButton to={tool.href} variant="secondary" size="md">
                    Open calculator
                  </LinkButton>
                </div>
              ) : (
                <p className="mt-5 text-xs font-medium uppercase tracking-wider text-ink/50">
                  In development
                </p>
              )}
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
