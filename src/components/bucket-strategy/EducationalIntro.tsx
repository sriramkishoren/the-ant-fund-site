export function EducationalIntro() {
  return (
    <section className="rounded-2xl border border-border bg-cream/50 p-6 sm:p-8">
      <h2 className="font-heading text-2xl font-semibold text-teal-dark">
        The two-bucket idea, in plain English
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
        <p>
          You split your portfolio into two buckets. The{' '}
          <span className="font-medium text-teal-dark">stability bucket</span> holds a few years of
          spending in safe, boring assets — it&rsquo;s what you actually live on, so a market crash
          never forces you to sell stocks at the bottom. The{' '}
          <span className="font-medium text-teal-dark">growth bucket</span> holds your equities and
          does the long-run heavy lifting.
        </p>
        <p>
          Once a year you <span className="font-medium text-teal-dark">refill</span> the stability
          bucket by selling some growth — but <em>only after a decent year</em>. If stocks just fell
          hard, you skip the refill and let the stability bucket carry you, giving equities time to
          recover. A <span className="font-medium text-teal-dark">cap</span> keeps the safe bucket
          from getting so large it starves your long-term growth.
        </p>
        <p>
          The honest part most calculators skip: research (Blanchett, Morningstar) finds the bucket{' '}
          <em>structure</em> matters less than the <em>rules</em> — being willing to trim spending a
          little in bad years is what really protects a retirement. This planner models those rules
          so you can see their effect, not just a static withdrawal rate.
        </p>
      </div>
    </section>
  );
}
