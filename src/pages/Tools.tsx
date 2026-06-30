import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { getLiveTools, getSoonTools, type ToolDef } from '@/features/tools/registry';

export default function Tools() {
  const live = getLiveTools();
  const soon = getSoonTools();

  return (
    <>
      <Seo
        title="Tools"
        description="Free, fully client-side calculators for retirement planning, financial independence, and long-term investing — including a Monte Carlo retirement simulator."
        path="/tools"
      />
      <Container className="py-12 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
            Tools
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            Calculators that show their work.
          </h1>
          <p className="mt-4 text-base text-ink/75">
            Each tool runs entirely in your browser — your inputs never leave your device.
            Pick one to begin.
          </p>
        </header>

        {live.length > 0 ? (
          <section className="mt-12">
            <h2 className="sr-only">Available tools</h2>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((tool) => (
                <LiveToolTile key={tool.slug} tool={tool} />
              ))}
            </ul>
          </section>
        ) : null}

        {soon.length > 0 ? (
          <section className="mt-16">
            <header className="mx-auto max-w-3xl text-center">
              <h2 className="font-heading text-2xl font-semibold text-teal-dark sm:text-3xl">
                Coming next
              </h2>
              <p className="mt-3 text-sm text-ink/70">
                The toolkit is growing. These are the next ones planned.
              </p>
            </header>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {soon.map((tool) => (
                <SoonToolTile key={tool.slug} tool={tool} />
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </>
  );
}

function LiveToolTile({ tool }: { tool: ToolDef }) {
  return (
    <li>
      <Link
        to={`/tools/${tool.slug}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-amber/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-amber">
            Available now
          </span>
          <span className="text-xs text-ink/55">{tool.category}</span>
        </div>
        <h3 className="font-heading text-xl font-semibold text-teal-dark">{tool.name}</h3>
        <p className="mt-2 flex-1 text-sm text-ink/75">{tool.description}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-teal-dark group-hover:underline">
          Open tool <span aria-hidden="true">→</span>
        </span>
      </Link>
    </li>
  );
}

function SoonToolTile({ tool }: { tool: ToolDef }) {
  return (
    <li className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 opacity-80 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink/55">
          Coming soon
        </span>
        <span className="text-xs text-ink/55">{tool.category}</span>
      </div>
      <h3 className="font-heading text-lg font-semibold text-teal-dark">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm text-ink/70">{tool.description}</p>
    </li>
  );
}
