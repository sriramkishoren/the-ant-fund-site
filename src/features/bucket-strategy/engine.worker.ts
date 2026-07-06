// Web Worker: runs the bucket-strategy engine off the main thread. Computes the
// primary run and the guardrails-off run with the SAME seed so the comparison
// overlay differs only by the rules, not by the market draws. Progress spans
// both runs (total = 2 × numRuns).

import { simulateBucketStrategy } from './engine';
import type { WorkerInbound, WorkerOutbound } from './types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(msg: WorkerOutbound): void {
  ctx.postMessage(msg);
}

ctx.addEventListener('message', (e: MessageEvent<WorkerInbound>) => {
  const msg = e.data;
  if (msg.type !== 'run') return;

  try {
    const seed = msg.params.seed ?? (Date.now() >>> 0);
    const runs = msg.params.numRuns;
    const total = runs * 2;

    const primary = simulateBucketStrategy(
      { ...msg.params, seed },
      { onProgress: (completed) => post({ type: 'progress', completed, total }) },
    );

    const guardrailsOff = simulateBucketStrategy(
      { ...msg.params, seed, guardrailsEnabled: false },
      { onProgress: (completed) => post({ type: 'progress', completed: runs + completed, total }) },
    );

    post({ type: 'done', primary, guardrailsOff });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
