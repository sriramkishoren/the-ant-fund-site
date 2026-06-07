import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';

export default function Blog() {
  return (
    <>
      <Seo
        title="Blog"
        description="Plain-language essays on retirement, investing, and financial independence — written for everyday investors."
        path="/blog"
      />
      <Container className="py-20">
        <h1 className="font-heading text-4xl font-semibold text-teal-dark">Blog</h1>
        <p className="mt-4 max-w-2xl text-ink/80">Articles coming soon.</p>
      </Container>
    </>
  );
}
