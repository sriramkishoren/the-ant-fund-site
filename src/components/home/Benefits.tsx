import { Container } from '@/components/layout/Container';

type Benefit = {
  title: string;
  body: string;
  icon: JSX.Element;
};

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div
    aria-hidden="true"
    className="grid h-11 w-11 place-items-center rounded-lg bg-teal/10 text-teal-dark"
  >
    {children}
  </div>
);

const benefits: Benefit[] = [
  {
    title: 'Compounding starts working for you',
    body: 'The earliest dollar you invest is the most powerful one. Seeing that on a chart is harder to ignore than reading about it.',
    icon: (
      <Icon>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17 9 11l4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      </Icon>
    ),
  },
  {
    title: 'Confidence about the future',
    body: 'A plan you’ve stress-tested is one you can stick with when markets get noisy — which is exactly when sticking matters most.',
    icon: (
      <Icon>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </Icon>
    ),
  },
  {
    title: 'See the tradeoffs before you commit',
    body: 'Retire two years later or save $200 more a month — both move the needle. Numbers let you choose with your eyes open.',
    icon: (
      <Icon>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M5 8h14" />
          <path d="M5 16h14" />
        </svg>
      </Icon>
    ),
  },
  {
    title: 'Plans that survive bad markets',
    body: 'Average returns hide tail risk. Monte Carlo asks what happens in the 10% of futures that go badly — and whether you still make it.',
    icon: (
      <Icon>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      </Icon>
    ),
  },
];

export function Benefits() {
  return (
    <section className="bg-cream">
      <Container className="py-20">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
            Why plan
          </p>
          <h2 className="font-heading text-3xl font-semibold text-teal-dark sm:text-4xl">
            A plan turns hope into a number.
          </h2>
          <p className="mt-4 text-ink/80">
            Retirement planning isn’t about predicting the future. It’s about
            preparing for the realistic range of futures you might actually get.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="flex flex-col">
              {b.icon}
              <h3 className="mt-4 font-heading text-lg text-teal-dark">{b.title}</h3>
              <p className="mt-2 text-sm text-ink/80">{b.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
