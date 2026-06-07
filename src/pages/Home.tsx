import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';

export default function Home() {
  return (
    <Container className="py-20">
      <section className="max-w-2xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-teal">
          The Ant Fund
        </p>
        <h1 className="font-heading text-5xl font-semibold leading-tight text-teal-dark">
          Slow, steady wealth for everyday investors.
        </h1>
        <p className="mt-6 text-lg text-ink/80">
          Calculators, education, and clear thinking on the road to financial
          independence — without the jargon.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="rounded-md bg-amber px-5 py-3 font-medium text-ink no-underline shadow-sm hover:bg-gold"
          >
            Try the retirement calculator
          </Link>
          <Link
            to="/blog"
            className="rounded-md border border-teal px-5 py-3 font-medium text-teal-dark no-underline hover:bg-teal/5"
          >
            Read the blog
          </Link>
        </div>
      </section>
    </Container>
  );
}
