import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="That page doesn’t exist." path="/404" />
      <Container className="py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-teal">404</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark">
          We couldn’t find that page.
        </h1>
        <p className="mt-4 text-ink/80">
          Try heading{' '}
          <Link to="/" className="text-teal">
            home
          </Link>{' '}
          or visiting the{' '}
          <Link to="/tools" className="text-teal">
            tools
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
