import { Container } from '@/components/layout/Container';
import { LinkButton } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft teal/gold backdrop shape — kept inline so we don't ship an image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
      </div>

      <Container className="grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-teal">
            The Ant Fund
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-[1.1] text-teal-dark sm:text-5xl lg:text-6xl">
            Slow, steady wealth for everyday investors.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/80">
            Calculators, education, and clear thinking on the road to financial
            independence — without the jargon, without the hype.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton
              to="/tools/monte-carlo-retirement-calculator"
              variant="primary"
              size="lg"
            >
              Try the retirement calculator
            </LinkButton>
            <LinkButton to="/blog" variant="secondary" size="lg">
              Read the blog
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          {/* Decorative coin-stack motif — semantic placeholder for future ant + coin illustration */}
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-teal/15 via-cream to-gold/20 p-10 shadow-sm">
            <div className="grid h-full place-items-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full bg-amber shadow-md" />
                <div className="h-16 w-16 rounded-full bg-gold shadow-md" />
                <div className="h-12 w-12 rounded-full bg-teal shadow-md" />
                <p className="mt-4 font-heading text-xl text-teal-dark">
                  one ant. one coin. compounded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
