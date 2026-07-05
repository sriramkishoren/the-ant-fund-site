import { formatCurrency, formatYears } from '@/features/investment-calculator/format';
import { formatPercent } from '@/lib/format';

type Kind = 'currency' | 'percent' | 'years';

type Props = {
  label: string;
  value: number | null;
  kind: Kind;
};

function render(value: number, kind: Kind): string {
  switch (kind) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return formatPercent(value);
    case 'years':
      return formatYears(value);
  }
}

/**
 * The read-only slot that replaces an editable input when that field is the one
 * being solved for. Visually distinct (teal wash) so it reads as an answer, not
 * a control.
 */
export function SolvedField({ label, value, kind }: Props) {
  return (
    <div>
      <span className="block text-sm font-medium text-teal-dark">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2">
        <span aria-hidden="true" className="text-xs font-medium uppercase tracking-wide text-teal">
          =
        </span>
        <span className="font-heading text-lg font-semibold text-teal-dark">
          {value === null ? 'Not reachable' : render(value, kind)}
        </span>
      </div>
    </div>
  );
}
