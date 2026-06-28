// ISO date strings like "2026-06-28" are parsed by `new Date()` as UTC
// midnight, which formats as the *previous* day in any US (negative-offset)
// timezone. Build a local-time Date from the parts so authored YYYY-MM-DD
// always displays as that exact calendar day.
export function parsePostDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return new Date(iso);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
