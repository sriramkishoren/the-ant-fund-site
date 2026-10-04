import { SelectField } from '@/components/ui/Field';
import { NumericField } from '@/components/ui/NumericField';
import { STRATEGY_BLURBS, STRATEGY_LABELS } from '@/features/options-calculator/defaults';
import { isSeller, usesCostBasis } from '@/features/options-calculator/engine';
import type { OptionInput, OptionStrategy } from '@/features/options-calculator/types';
import { useCurrency } from '@/lib/currency-context';

type Props = {
  input: OptionInput;
  onChange: (patch: Partial<OptionInput>) => void;
};

const STRATEGY_OPTIONS = (Object.keys(STRATEGY_LABELS) as OptionStrategy[]).map((value) => ({
  value,
  label: STRATEGY_LABELS[value],
}));

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{children}</h3>;
}

export function InputPanel({ input, onChange }: Props) {
  const { meta } = useCurrency();
  const seller = isSeller(input.strategy);
  const covered = usesCostBasis(input.strategy);

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="space-y-3">
        <SelectField
          label="Strategy"
          value={input.strategy}
          onChange={(e) => onChange({ strategy: e.target.value as OptionStrategy })}
          options={STRATEGY_OPTIONS}
        />
        <p className="rounded-lg border border-border bg-cream/50 px-3 py-2 text-xs leading-relaxed text-ink/75">
          {STRATEGY_BLURBS[input.strategy]}
        </p>
      </div>

      <div className="space-y-4">
        <SectionTitle>The contract</SectionTitle>
        <NumericField
          label="Current price of the underlying"
          value={input.currentPrice}
          onChange={(n) => onChange({ currentPrice: n })}
          prefix={meta.symbol}
          min={0}
          step={1}
        />
        <NumericField
          label="Strike price"
          value={input.strike}
          onChange={(n) => onChange({ strike: n })}
          prefix={meta.symbol}
          min={0}
          step={1}
        />
        <NumericField
          label={seller ? 'Premium received (per share)' : 'Premium paid (per share)'}
          value={input.premium}
          onChange={(n) => onChange({ premium: n })}
          prefix={meta.symbol}
          min={0}
          step={0.05}
          help="The option's price as quoted — per share, not per contract."
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Size</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <NumericField
            label="Contracts"
            value={input.contracts}
            onChange={(n) => onChange({ contracts: n })}
            min={1}
            max={1000}
            step={1}
            inputMode="numeric"
          />
          <NumericField
            label="Shares per contract"
            value={input.sharesPerContract}
            onChange={(n) => onChange({ sharesPerContract: n })}
            min={1}
            max={10_000}
            step={1}
            inputMode="numeric"
            tip="100 for standard US equity options. Elsewhere — Indian contracts, for example — this is the lot size, which differs per underlying."
          />
        </div>
        {covered ? (
          <NumericField
            label="Your cost basis (per share)"
            value={input.costBasis}
            onChange={(n) => onChange({ costBasis: n })}
            prefix={meta.symbol}
            min={0}
            step={1}
            help="What you actually paid for the shares you already own. It sets your real breakeven and your profit if the shares are called away."
          />
        ) : null}
        {seller ? (
          <NumericField
            label="Days to expiration"
            value={input.daysToExpiry}
            onChange={(n) => onChange({ daysToExpiry: n })}
            min={0}
            max={1095}
            step={1}
            inputMode="numeric"
            suffix="days"
            help="Used to annualise the premium return. Set to 0 to hide it."
          />
        ) : null}
      </div>
    </div>
  );
}
