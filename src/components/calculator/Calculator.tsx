import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_INPUTS } from '@/features/monte-carlo/defaults';
import { runSimulation } from '@/features/monte-carlo/engine';
import type { SimInputs, SimResult, WorkerOutbound } from '@/features/monte-carlo/types';
import { CalculatorForm } from './CalculatorForm';
import { SummaryCards } from './SummaryCards';
import { TrajectoryChart } from './charts/TrajectoryChart';
import { OutcomeHistogram } from './charts/OutcomeHistogram';
import { YearByYearTable } from './YearByYearTable';

type Status =
  | { kind: 'idle' }
  | { kind: 'running'; completed: number; total: number }
  | { kind: 'done'; result: SimResult; usedInputs: SimInputs }
  | { kind: 'error'; message: string };

export function Calculator() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const workerRef = useRef<Worker | null>(null);
  const workerSupported = useRef<boolean>(typeof Worker !== 'undefined');

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const run = useCallback((inputs: SimInputs) => {
    setStatus({ kind: 'running', completed: 0, total: inputs.numSims });

    // Try Web Worker first; fall back to main-thread execution if construction fails
    // (e.g. some odd CSP / preview environments). The engine is fast enough
    // that the fallback still finishes in well under a second for 10k runs.
    if (workerSupported.current) {
      try {
        // Always recreate the worker per run — simpler than tracking state.
        workerRef.current?.terminate();
        const worker = new Worker(
          new URL('@/features/monte-carlo/engine.worker.ts', import.meta.url),
          { type: 'module' },
        );
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerOutbound>) => {
          const msg = e.data;
          if (msg.type === 'progress') {
            setStatus({ kind: 'running', completed: msg.completed, total: msg.total });
          } else if (msg.type === 'done') {
            setStatus({ kind: 'done', result: msg.result, usedInputs: inputs });
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

        worker.postMessage({ type: 'run', inputs });
        return;
      } catch {
        workerSupported.current = false;
      }
    }

    // Synchronous fallback — yield to the browser via microtask so the UI can
    // paint the busy state first.
    Promise.resolve().then(() => {
      try {
        const result = runSimulation(inputs, {
          onProgress: (completed, total) =>
            setStatus({ kind: 'running', completed, total }),
        });
        setStatus({ kind: 'done', result, usedInputs: inputs });
      } catch (err) {
        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    });
  }, []);

  const busy = status.kind === 'running';

  return (
    <div className="space-y-8">
      <CalculatorForm initial={DEFAULT_INPUTS} busy={busy} onRun={run} />

      <ResultsRegion status={status} />
    </div>
  );
}

function ResultsRegion({ status }: { status: Status }) {
  if (status.kind === 'idle') {
    return (
      <div
        aria-live="polite"
        className="rounded-xl border border-dashed border-border bg-cream/60 p-8 text-center text-ink/65"
      >
        Set your assumptions above and click <span className="font-medium text-teal-dark">Run simulation</span> to see how often your plan survives.
      </div>
    );
  }

  if (status.kind === 'running') {
    const pct = status.total === 0 ? 0 : Math.round((status.completed / status.total) * 100);
    return (
      <div aria-live="polite" className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between text-sm text-ink">
          <span>Running {status.total.toLocaleString()} simulations…</span>
          <span className="font-medium text-teal-dark">{pct}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream">
          <div
            className="h-full bg-teal transition-[width] duration-150 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (status.kind === 'error') {
    return (
      <div role="alert" className="rounded-xl border border-amber/60 bg-amber/5 p-4 text-sm text-ink">
        Something went wrong while running the simulation: {status.message}
      </div>
    );
  }

  const { result, usedInputs } = status;
  return (
    <div className="space-y-6">
      <SummaryCards result={result} />
      <div className="rounded-md border border-border bg-cream/50 px-4 py-3 text-xs text-ink/70">
        These are hypothetical Monte Carlo projections based on the assumptions you entered — not predictions, not guarantees, and not financial advice. Real markets do not draw returns from a textbook normal distribution.
      </div>
      <TrajectoryChart result={result} retirementAge={usedInputs.retirementAge} />
      <OutcomeHistogram result={result} />
      <YearByYearTable result={result} />
    </div>
  );
}
