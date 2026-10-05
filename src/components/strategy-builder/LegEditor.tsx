import { NumericField } from '@/components/ui/NumericField';
import { SelectField } from '@/components/ui/Field';
import type { Leg } from '@/features/strategy-builder/types';
import { useCurrency } from '@/lib/currency-context';

type Props = {
  legs: Leg[];
  onChange: (id: string, patch: Partial<Leg>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

const KIND_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'put', label: 'Put' },
  { value: 'stock', label: 'Stock' },
];
const ACTION_OPTIONS = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
];

export function LegEditor({ legs, onChange, onRemove, onAdd }: Props) {
  const { meta } = useCurrency();

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold text-teal-dark">Legs</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-amber px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-gold focus-visible:outline-2 focus-visible:outline-teal"
        >
          + Add leg
        </button>
      </div>

      {legs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-cream/50 p-4 text-center text-xs text-ink/60">
          No legs yet. Pick a strategy above, or add one.
        </p>
      ) : null}

      <ul className="space-y-4">
        {legs.map((leg, i) => {
          const isStock = leg.kind === 'stock';
          return (
            <li key={leg.id} className="rounded-xl border border-border bg-cream/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal">
                  Leg {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(leg.id)}
                  className="text-xs text-ink/55 underline-offset-2 hover:text-amber hover:underline focus-visible:outline-2 focus-visible:outline-teal"
                  aria-label={`Remove leg ${i + 1}`}
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Action"
                  value={leg.action}
                  onChange={(e) => onChange(leg.id, { action: e.target.value as Leg['action'] })}
                  options={ACTION_OPTIONS}
                />
                <SelectField
                  label="Type"
                  value={leg.kind}
                  onChange={(e) => {
                    const kind = e.target.value as Leg['kind'];
                    onChange(
                      leg.id,
                      kind === 'stock'
                        ? { kind, strike: undefined, daysToExpiry: undefined, iv: undefined }
                        : {
                            kind,
                            strike: leg.strike ?? 0,
                            daysToExpiry: leg.daysToExpiry ?? 45,
                            iv: leg.iv ?? 0.3,
                          },
                    );
                  }}
                  options={KIND_OPTIONS}
                />
                <NumericField
                  label={isStock ? 'Shares' : 'Contracts'}
                  value={leg.quantity}
                  onChange={(n) => onChange(leg.id, { quantity: n })}
                  min={1}
                  step={1}
                  inputMode="numeric"
                />
                <NumericField
                  label={isStock ? 'Share price' : 'Premium'}
                  value={leg.premium}
                  onChange={(n) => onChange(leg.id, { premium: n })}
                  prefix={meta.symbol}
                  min={0}
                  step={0.05}
                />
                {!isStock ? (
                  <>
                    <NumericField
                      label="Strike"
                      value={leg.strike ?? 0}
                      onChange={(n) => onChange(leg.id, { strike: n })}
                      prefix={meta.symbol}
                      min={0}
                      step={1}
                    />
                    <NumericField
                      label="Days to expiry"
                      value={leg.daysToExpiry ?? 0}
                      onChange={(n) => onChange(leg.id, { daysToExpiry: n })}
                      min={0}
                      max={1095}
                      step={1}
                      inputMode="numeric"
                      suffix="d"
                    />
                    <NumericField
                      className="col-span-2"
                      label="Implied volatility"
                      value={leg.iv ?? 0}
                      onChange={(n) => onChange(leg.id, { iv: n })}
                      asPercent
                      min={1}
                      max={500}
                      step={1}
                      suffix="%"
                      help="Per leg, so a spread can carry different volatility at each strike."
                    />
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
