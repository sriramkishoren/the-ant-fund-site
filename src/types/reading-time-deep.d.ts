// Type shim for the deep-imported reading-time function file. The package's
// shipped `.d.ts` only declares the top-level entry, but we deliberately
// import from the deep path to avoid pulling the stream/util code into the
// browser bundle (see src/content/blog/index.ts for the why).
declare module 'reading-time/lib/reading-time.js' {
  import type { ReadTimeResults, Options } from 'reading-time';
  export default function readingTime(text: string, options?: Options): ReadTimeResults;
}
