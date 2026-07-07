import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_BUCKET_PARAMS } from '@/features/bucket-strategy/defaults';
import { simulateBucketStrategy } from '@/features/bucket-strategy/engine';
import type {
  BucketParams,
  SimulationResult,
  WorkerOutbound,
} from '@/features/bucket-strategy/types';
import { formatMoney, formatMoneyCompact } from '@/features/bucket-strategy/money';
import { InputPanel } from './InputPanel';
import { AllocationCards } from './AllocationCards';
import { FanChart } from './FanChart';
import { DotComStressChart } from './DotComStressChart';
import { WalkthroughTable } from './WalkthroughTable';
import { RulesPanel } from './RulesPanel';
import { EducationalIntro } from './EducationalIntro';
import { Disclaimer } from './Disclaimer';

interface Results {
  primary: SimulationResult;
  guardrailsOff: SimulationResult;
  usedParams: BucketParams;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'running'; completed: number; total: number }
  | { kind: 'done'; results: Results }
  | { kind: 'error'; message: string };

export function BucketPlanner() {
  const [params, setParams] = useState<BucketParams>(DEFAULT_BUCKET_PARAMS);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const workerRef = useRef<Worker | null>(null);
  const workerSupported = useRef<boolean>(typeof Worker !== 'undefined');
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const run = useCallback(() => {
    const inputs = paramsRef.current;
    setStatus({ kind: 'running', completed: 0, total: inputs.numRuns * 2 });

    if (workerSupported.current) {
      try {
        workerRef.current?.terminate();
        const worker = new Worker(
          new URL('@/features/bucket-strategy/engine.worker.ts', import.meta.url),
          { type: 'module' },
        );
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerOutbound>) => {
          const msg = e.data;
          if (msg.type === 'progress') {
            setStatus({ kind: 'running', completed: msg.completed, total: msg.total });
          } else if (msg.type === 'done') {
            setStatus({
              kind: 'done',
              results: { primary: msg.primary, guardrailsOff: msg.guardrailsOff, usedParams: inputs },
            });
            worker.terminate();
            workerRef.current = null;
          } else if (msg.type === 'error') {
            setStatus({ kind: 'error', message: msg.message });
            worker.terminate();
            workerRef.current = null;
          }
        };
        worker.onerror = (err) => {
          setStatus({ kind: 'error', message: err.message || 'Worker error' });
          worker.terminate();
          workerRef.current = null;
        };

        worker.postMessage({ type: 'run', params: inputs });
        return;
      } catch {
        workerSupported.current = false;
      }
    }

    // Synchronous fallback (yields once so the busy state paints first).
    Promise.resolve().then(() => {
      try {
        const seed = inputs.seed ?? (Date.now() >>> 0);
        const primary = simulateBucketStrategy({ ...inputs, seed });
        const guardrailsOff = simulateBucketStrategy({
          ...inputs,
          seed,
          guardrailsEnabled: false,
        });
        setStatus({ kind: 'done', results: { primary, guardrailsOff, usedParams: inputs } });
      } catch (err) {
        setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
      }
    });
  }, []);

  // Auto-run on mount and (debounced) whenever inputs change, so every input —
  // including the cap — is always reflected in the results without a manual
  // step. The 400ms debounce coalesces rapid edits (typing, dragging a slider).
  useEffect(() => {
    const id = setTimeout(() => run(), 400);
    return () => clearTimeout(id);
  }, [params, run]);

  const patch = (p: Partial<BucketParams>) => {
    setParams((prev) => ({ ...prev, ...p }));
  };

  const busy = status.kind === 'running';

  return (
    <div className="space-y-8">
      <EducationalIntro />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(340px,400px)_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <InputPanel params={params} onChange={patch} onRun={run} busy={busy} />
        </div>

        <div className="space-y-6">
          <RulesPanel params={params} />
          <ResultsRegion status={status} />
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}

function ResultsRegion({ status }: { status: Status }) {
  if (status.kind === 'idle') {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-cream/60 p-8 text-center text-ink/65">
        Set your assumptions and run the simulation to see how the plan holds up.
      </div>
    );
  }

  if (status.kind === 'running') {
    const pct = status.total === 0 ? 0 : Math.round((status.completed / status.total) * 100);
    return (
      <div aria-live="polite" className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm text-ink">
          <span>Running {(status.total / 2).toLocaleString()} paths (×2 for the comparison)…</span>
          <span className="font-medium text-teal-dark">{pct}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-teal transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (status.kind === 'error') {
    return (
      <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-800">
        Something went wrong running the simulation: {status.message}
      </div>
    );
  }

  const { primary, guardrailsOff, usedParams } = status.results;

  return (
    <div className="space-y-6">
      <AllocationCards result={primary} totalPortfolio={usedParams.totalPortfolio} />
      <FlexibilitySummary result={primary} />
      <FanChart primary={primary} comparison={guardrailsOff} />
      <DotComStressChart path={primary.historicalPath} />
      <WalkthroughTable walkthrough={primary.walkthrough} params={usedParams} />
    </div>
  );
}

function FlexibilitySummary({ result }: { result: SimulationResult }) {
  const spendingRetention =
    result.baselineFinalRealSpending > 0
      ? (result.medianFinalRealSpending / result.baselineFinalRealSpending) * 100
      : 0;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/60">
          Median years with a spending cut
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold text-teal-dark">
          {result.medianYearsOfCuts.toFixed(0)}
        </p>
        <p className="mt-1 text-xs text-ink/60">
          across a {result.meta.horizonYears}-year retirement
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/60">
          Median final-year spending (real)
        </p>
        <p
          className="mt-2 font-heading text-2xl font-semibold text-teal-dark"
          title={formatMoney(result.medianFinalRealSpending)}
        >
          {formatMoneyCompact(result.medianFinalRealSpending)}
        </p>
        <p className="mt-1 text-xs text-ink/60">
          {spendingRetention.toFixed(0)}% of the fully-indexed{' '}
          {formatMoneyCompact(result.baselineFinalRealSpending)} baseline
        </p>
      </div>
    </div>
  );
}
