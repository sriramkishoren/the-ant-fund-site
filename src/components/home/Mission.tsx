import { Container } from '@/components/layout/Container';

export function Mission() {
  return (
    <section className="border-y border-border bg-surface">
      <Container className="py-16 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
          Our mission
        </p>
        <p className="mx-auto max-w-3xl font-heading text-2xl leading-snug text-teal-dark sm:text-3xl">
          Most personal finance is loud, complicated, or selling something. We
          think the opposite works better: small, steady contributions, patient
          decisions, and tools that make the math visible.
        </p>
      </Container>
    </section>
  );
}
