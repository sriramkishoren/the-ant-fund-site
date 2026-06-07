import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';

export default function Products() {
  return (
    <>
      <Seo
        title="Tools"
        description="Calculators for retirement planning, financial independence, and long-term investing — all fully client-side."
        path="/products"
      />
      <Container className="py-20">
        <h1 className="font-heading text-4xl font-semibold text-teal-dark">Tools</h1>
        <p className="mt-4 max-w-2xl text-ink/80">
          The Monte Carlo retirement calculator and other tools live here. Coming soon.
        </p>
      </Container>
    </>
  );
}
