import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { HeadlineCard } from '@/components/fire-calculator/HeadlineCard';
import { SpendingInput } from '@/components/fire-calculator/SpendingInput';
import { YearsToRetirementInput } from '@/components/fire-calculator/YearsToRetirementInput';
import { InflationInput } from '@/components/fire-calculator/InflationInput';
import { TaxRateInput } from '@/components/fire-calculator/TaxRateInput';
import { SwrSlider } from '@/components/fire-calculator/SwrSlider';
import { CapeIndicator } from '@/components/fire-calculator/CapeIndicator';
import { Disclaimer } from '@/components/fire-calculator/Disclaimer';
import type { ShillerDataset } from '@/features/fire-calculator/data-types';
import {
  computeHeadline,
  defaultSwrFromCape,
} from '@/features/fire-calculator/engine';
import {
  decodeBeginnerState,
  encodeBeginnerState,
} from '@/features/fire-calculator/url-state';
import { withBase } from '@/lib/basePath';

// Beginner-tier defaults. Match docs/fire-calculator/SPEC.md §3.
const DEFAULT_SPENDING = 50_000;
const DEFAULT_YEARS_TO_RETIREMENT = 0;
const DEFAULT_INFLATION = 0.03; // 3% — standard FIRE-community assumption
const DEFAULT_TAX_RATE = 0; // off by default — user opts in if they need gross-up
const FALLBACK_CAPE = 38; // used until the bundled dataset loads

export default function FireCalculator() {
  // Hydration gate: dataset fetch + window-only APIs run after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Seo
        title="FIRE Calculator"
        description="Calculate your FIRE number with a valuation-aware safe withdrawal rate. Fully client-side — your numbers never leave your device."
        path="/tools/fire-calculator"
      />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: 'Tools', to: '/tools' }, { label: 'FIRE Calculator' }]}
        />
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber">
            Retirement
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-teal-dark sm:text-5xl">
            FIRE Calculator
          </h1>
          <p className="mt-4 text-base text-ink/75">
            The one equation underneath every FIRE plan:{' '}
            <span className="font-medium text-teal-dark">spending ÷ SWR</span>. Pick a rate, see the
            number that funds your retirement at that rate.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-3xl">
          {mounted ? <BeginnerTier /> : <Loading />}
        </div>
      </Container>
    </>
  );
}

function Loading() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-cream/60 p-12 text-center text-ink/60">
      Loading calculator…
    </div>
  );
}

function BeginnerTier() {
  // ─── Hydrate initial state from URL (if any) ─────────────────────────
  const initialUrlState = useMemo(
    () =>
      typeof window !== 'undefined'
        ? decodeBeginnerState(window.location.search)
        : {},
    [],
  );

  const [dataset, setDataset] = useState<ShillerDataset | null>(null);
  const [datasetError, setDatasetError] = useState<string | null>(null);
  const [spending, setSpending] = useState<number>(
    initialUrlState.spending ?? DEFAULT_SPENDING,
  );
  const [yearsToRetirement, setYearsToRetirement] = useState<number>(
    initialUrlState.yearsToRetirement ?? DEFAULT_YEARS_TO_RETIREMENT,
  );
  const [inflationRate, setInflationRate] = useState<number>(
    initialUrlState.inflationRate ?? DEFAULT_INFLATION,
  );
  const [taxRate, setTaxRate] = useState<number>(
    initialUrlState.taxRate ?? DEFAULT_TAX_RATE,
  );

  // CAPE: bundled default (from dataset) unless the user has set an override.
  const [capeOverride, setCapeOverride] = useState<number | undefined>(
    initialUrlState.capeOverride,
  );

  const effectiveCape = capeOverride ?? dataset?.rows[dataset.rows.length - 1].cape ?? FALLBACK_CAPE;
  const capeAsOf = dataset?.asOf ?? '';
  const capeAwareRate = defaultSwrFromCape(effectiveCape);

  // SWR — start from URL value, else from the valuation-aware default once
  // CAPE is known. Re-sync the "default" once when the dataset arrives,
  // unless the URL set a value.
  const [swr, setSwr] = useState<number>(initialUrlState.swr ?? capeAwareRate);
  const userPickedSwr = initialUrlState.swr !== undefined;
  useEffect(() => {
    if (dataset && !userPickedSwr) setSwr(capeAwareRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

  // ─── Fetch the Shiller dataset ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch(withBase('data/shiller.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ShillerDataset) => {
        if (!cancelled) setDataset(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDatasetError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Persist state to the URL (debounced via rAF) ─────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.requestAnimationFrame(() => {
      const qs = encodeBeginnerState({
        spending,
        swr,
        yearsToRetirement,
        inflationRate,
        taxRate,
        capeOverride,
      });
      const next = `${window.location.pathname}?${qs}`;
      window.history.replaceState(null, '', next);
    });
    return () => window.cancelAnimationFrame(id);
  }, [spending, swr, yearsToRetirement, inflationRate, taxRate, capeOverride]);

  // ─── Headline math ────────────────────────────────────────────────────
  // Gross up the user's spending to the pre-tax withdrawal needed to net it.
  // taxRate=0 → no gross-up, withdrawal === spending.
  const grossWithdrawal = taxRate > 0 && taxRate < 1 ? spending / (1 - taxRate) : spending;
  const { fireNumber, multiple } = computeHeadline({ annualSpending: grossWithdrawal, swr });

  // ─── Copy link ────────────────────────────────────────────────────────
  const handleCopyLink = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard may be unavailable; fall back silently.
    }
  }, []);

  return (
    <div className="space-y-8">
      <HeadlineCard
        fireNumber={fireNumber}
        multiple={multiple}
        swr={swr}
        annualSpending={spending}
        grossWithdrawal={grossWithdrawal}
        taxRate={taxRate}
        yearsToRetirement={yearsToRetirement}
        inflationRate={inflationRate}
      />

      <div className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-sm sm:grid-cols-1">
        <SpendingInput value={spending} onChange={setSpending} />
        <TaxRateInput value={taxRate} onChange={setTaxRate} />
        <div className="grid gap-6 sm:grid-cols-2">
          <YearsToRetirementInput value={yearsToRetirement} onChange={setYearsToRetirement} />
          <InflationInput value={inflationRate} onChange={setInflationRate} />
        </div>
        <SwrSlider value={swr} onChange={setSwr} capeAwareRate={capeAwareRate} />
        {dataset ? (
          <CapeIndicator
            cape={effectiveCape}
            asOf={capeAsOf}
            isOverride={capeOverride !== undefined}
            defaultCape={dataset.rows[dataset.rows.length - 1].cape}
            onChange={setCapeOverride}
          />
        ) : datasetError ? (
          <div
            role="alert"
            className="rounded-md border border-amber/60 bg-amber/5 px-3 py-2 text-xs text-ink"
          >
            Couldn&apos;t load the historical dataset ({datasetError}). The valuation-aware default is using a fallback CAPE of {FALLBACK_CAPE}.
          </div>
        ) : (
          <p className="text-xs text-ink/55">Loading historical data…</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-md border border-teal px-3 py-2 text-sm font-medium text-teal-dark transition-colors hover:bg-teal/5 focus-visible:outline-2 focus-visible:outline-teal"
        >
          Copy shareable link
        </button>
        <p className="text-xs text-ink/55">
          The Intermediate and Advanced tiers (Monte Carlo simulation, withdrawal rules,
          guaranteed-income streams) are coming next.
        </p>
      </div>

      <Disclaimer />

      <p className="text-xs text-ink/55">
        Want the full methodology? Read{' '}
        <a
          href="/blog/your-fi-number"
          className="text-teal underline-offset-2 hover:underline"
        >
          Your FIRE number: every major method, calculated and compared
        </a>
        .
      </p>
    </div>
  );
}
