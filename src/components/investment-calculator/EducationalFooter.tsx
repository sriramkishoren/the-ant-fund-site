export function EducationalFooter() {
  return (
    <section className="rounded-2xl border border-border bg-cream/50 p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-semibold text-teal-dark">
        How compound interest works
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/80">
        <p>
          Compounding is interest earning interest. In year one your money grows by the return
          rate. In year two, that growth <em>also</em> grows — and so does every contribution you
          have added along the way. The longer the runway, the more the &ldquo;growth on growth&rdquo;
          pulls ahead of what you actually put in.
        </p>
        <p>
          That is why the <span className="font-medium text-teal-dark">Growth</span> slice of the
          chart starts thin and then bends upward. Early on, almost all of your balance is money you
          contributed. Given enough time, the interest can quietly become the largest piece —
          without you adding a single extra dollar.
        </p>
        <p>
          <span className="font-medium text-teal-dark">Compounding frequency</span> is how often
          interest is calculated and added back. More frequent compounding (monthly or daily rather
          than yearly) nudges the effective return slightly higher, because you start earning on
          your interest sooner. The difference is real but usually small next to the two things that
          matter most: how much you contribute and how long you leave it invested.
        </p>
        <p className="text-ink/70">
          Two honest caveats. Returns here are a single, steady assumption — real markets bounce
          around, so treat any projection as a rough shape, not a promise (our{' '}
          <a
            href="/tools/monte-carlo-retirement-calculator"
            className="text-teal underline-offset-2 hover:underline"
          >
            Monte Carlo calculator
          </a>{' '}
          shows the range of outcomes instead). And these figures ignore inflation and taxes, so a
          balance decades out will buy less than the same number does today.
        </p>
      </div>
    </section>
  );
}
