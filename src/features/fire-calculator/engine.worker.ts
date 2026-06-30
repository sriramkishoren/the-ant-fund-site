// Web Worker that runs the FIRE engine off the main thread. Vite bundles this
// when imported via `new Worker(new URL(...), { type: 'module' })`. Same
// pattern as the existing monte-carlo worker.

import { runFireSimulation } from './engine';
import type { WorkerInbound, WorkerOutbound } from './types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(msg: WorkerOutbound): void {
  ctx.postMessage(msg);
}

ctx.addEventListener('message', (e: MessageEvent<WorkerInbound>) => {
  const msg = e.data;
  if (msg.type !== 'run') return;
  try {
    const result = runFireSimulation(msg.input, msg.dataset, {
      onProgress: (completed, total) => post({ type: 'progress', completed, total }),
    });
    post({ type: 'done', result });
  } catch (err) {
    post({
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});
