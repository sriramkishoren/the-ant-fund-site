import { NumericField } from '@/components/ui/NumericField';
import type { MarketInputs } from '@/features/strategy-builder/types';
import { useCurrency } from '@/lib/currency-context';

type Props = {
  market: MarketInputs;
  onChange: (patch: Partial<MarketInputs>) => void;
  rangePct: number;
  onRangeChange: (n: number) => void;
};

export function MarketPanel({ market, onChange, rangePct, onRangeChange }: Props) {
  const { meta } = useCurrency();

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="font-heading text-base font-semibold text-teal-dark">Market</h3>

      <NumericField
        label="Underlying price"
        value={market.spot}
        onChange={(n) => onChange({ spot: n })}
        prefix={meta.symbol}
        min={0}
        step={1}
      />

      <div className="grid grid-cols-2 gap-3">
        <NumericField
          label="Risk-free rate"
          value={market.rate}
          onChange={(n) => onChange({ rate: n })}
          asPercent
          min={0}
          max={25}
          step={0.1}
          suffix="%"
        />
        <NumericField
          label="Dividend yield"
          value={market.dividendYield}
          onChange={(n) => onChange({ dividendYield: n })}
          asPercent
          min={0}
          max={25}
          step={0.1}
          suffix="%"
        />
      </div>

      <NumericField
        label="Shares per contract"
        value={market.sharesPerContract}
        onChange={(n) => onChange({ sharesPerContract: n })}
        min={1}
        max={10_000}
        step={1}
        inputMode="numeric"
        tip="100 for standard US equity options. Elsewhere this is the contract's lot size, which differs per underlying."
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="sb-ivmult" className="text-sm font-medium text-teal-dark">
            Volatility multiplier
          </label>
          <span className="font-heading text-base font-semibold text-teal-dark">
            ×{market.ivMultiplier.toFixed(2)}
          </span>
        </div>
        <input
          id="sb-ivmult"
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={market.ivMultiplier}
          onChange={(e) => onChange({ ivMultiplier: Number(e.target.value) })}
          className="mt-2 block w-full accent-teal"
        />
        <p className="mt-1 text-xs text-ink/60">
          Scales every leg&rsquo;s volatility at once — drop it below ×1 to model an earnings IV
          crush. It has no effect at expiration, where only intrinsic value is left.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="sb-range" className="text-sm font-medium text-teal-dark">
            Price range
          </label>
          <span className="font-heading text-base font-semibold text-teal-dark">
            ±{Math.round(rangePct * 100)}%
          </span>
        </div>
        <input
          id="sb-range"
          type="range"
          min={5}
          max={80}
          step={5}
          value={Math.round(rangePct * 100)}
          onChange={(e) => onRangeChange(Number(e.target.value) / 100)}
          className="mt-2 block w-full accent-teal"
        />
      </div>
    </div>
  );
}
