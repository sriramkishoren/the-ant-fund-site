import { formatYears } from '@/features/investment-calculator/format';
import { useCurrency } from '@/lib/currency-context';

type Kind = 'currency' | 'percent' | 'years';

type Props = {
  label: string;
  value: number | null;
  kind: Kind;
};

/**
 * The read-only slot that replaces an editable input when that field is the one
 * being solved for. Visually distinct (teal wash) so it reads as an answer, not
 * a control.
 */
export function SolvedField({ label, value, kind }: Props) {
  const { money, percent } = useCurrency();

  function render(v: number): string {
    switch (kind) {
      case 'currency':
        return money(v);
      case 'percent':
        return percent(v);
      case 'years':
        return formatYears(v);
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-teal-dark">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2">
        <span aria-hidden="true" className="text-xs font-medium uppercase tracking-wide text-teal">
          =
        </span>
        <span className="font-heading text-lg font-semibold text-teal-dark">
          {value === null ? 'Not reachable' : render(value)}
        </span>
      </div>
    </div>
  );
}
