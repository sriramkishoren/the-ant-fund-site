import { useState, type FormEvent } from 'react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    // === Email provider integration point ===
    // No backend exists. Wire a real provider here when one is chosen
    // (Buttondown, ConvertKit, Mailchimp). Until then, we just acknowledge
    // the submission client-side so the UI completes its loop.
    setSubmitted(true);
  }

  return (
    <section className="bg-surface border-y border-border">
      <Container className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-teal">
            Stay in touch
          </p>
          <h2 className="font-heading text-3xl font-semibold text-teal-dark sm:text-4xl">
            Occasional, useful, never spammy.
          </h2>
          <p className="mt-4 text-ink/80">
            One short email when a new tool ships or a long-form article goes
            live. Nothing else. Unsubscribe any time.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-lg border border-teal/30 bg-teal/5 p-5">
              <p className="font-heading text-lg text-teal-dark">Thanks — you’re on the list.</p>
              <p className="mt-1 text-sm text-ink/70">
                We’ll send the next update to <span className="font-medium">{email}</span>.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-md border border-border bg-cream px-4 py-3 text-base text-ink placeholder:text-ink/40 focus-visible:border-teal focus-visible:outline-none"
              />
              <Button type="submit" variant="primary" size="lg">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
