import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

// Illustrative, fictional testimonials — clearly labeled as samples so visitors
// don't mistake them for real customer quotes.
const testimonials: Testimonial[] = [
  {
    quote:
      'Running the simulator changed the way I think about retirement. Instead of one scary number, I see a range of futures — and I know what to do about the bad ones.',
    name: 'Avery J.',
    role: 'Software engineer, 38',
  },
  {
    quote:
      'I’ve read a hundred personal finance blogs and most of them sell something. This one just shows you the math and trusts you to draw your own conclusions.',
    name: 'Marcus L.',
    role: 'Teacher, 51',
  },
  {
    quote:
      'The 4% rule article finally made sense of something I’d been confused about for years. Short, clear, no jargon.',
    name: 'Priya R.',
    role: 'Early-career nurse, 27',
  },
];

export function Testimonials() {
  return (
    <section className="bg-cream">
      <Container className="py-20">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
              In their words
            </p>
            <h2 className="font-heading text-3xl font-semibold text-teal-dark sm:text-4xl">
              What readers say.
            </h2>
          </div>
          <Badge tone="neutral">Illustrative samples</Badge>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} as="article" className="flex flex-col">
              <p className="flex-1 text-ink/90">“{t.quote}”</p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-medium text-teal-dark">{t.name}</p>
                <p className="text-sm text-ink/60">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
