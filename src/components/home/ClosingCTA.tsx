import { Container } from '@/components/layout/Container';
import { LinkButton } from '@/components/ui/Button';

export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden bg-teal-dark text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
      >
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-gold blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-amber blur-3xl" />
      </div>
      <Container className="relative py-20 text-center">
        <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
          Ready to see your numbers?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream/85">
          Open the retirement calculator, plug in a few inputs, and watch ten
          thousand possible futures fan out in seconds.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton
            to="/tools/monte-carlo-retirement-calculator"
            variant="primary"
            size="lg"
          >
            Open the calculator
          </LinkButton>
          <LinkButton
            to="/blog"
            variant="ghost"
            size="lg"
            className="border border-cream/40 text-cream hover:bg-cream/10"
          >
            Browse the blog
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
