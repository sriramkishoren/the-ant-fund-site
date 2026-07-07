import { NumericInput } from '@/components/investment-calculator/NumericInput';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { RangeSlider } from './RangeSlider';
import { effectiveStabilityTarget } from '@/features/bucket-strategy/rules';
import { formatMoney } from '@/features/bucket-strategy/money';
import type { BucketParams } from '@/features/bucket-strategy/types';

type Props = {
  params: BucketParams;
  onChange: (patch: Partial<BucketParams>) => void;
  onRun: () => void;
  busy: boolean;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{children}</h3>
  );
}

export function InputPanel({ params, onChange, onRun, busy }: Props) {
  const annualExpenses = params.monthlyExpenses * 12;
  const target = effectiveStabilityTarget({
    stabilityYears: params.stabilityYears,
    annualExpenses,
    capPct: params.stabilityCapPct,
    portfolio: params.totalPortfolio,
  });
  const yearsRule = params.stabilityYears * annualExpenses;
  const capRule = (params.stabilityCapPct / 100) * params.totalPortfolio;
  const capBinds = capRule < yearsRule;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      {/* Portfolio & spending */}
      <div className="space-y-4">
        <SectionTitle>Portfolio &amp; spending</SectionTitle>
        <NumericInput
          label="Total portfolio"
          value={params.totalPortfolio}
          onChange={(n) => onChange({ totalPortfolio: n })}
          prefix="$"
          min={0}
          step={10_000}
        />
        <NumericInput
          label="Monthly expenses"
          value={params.monthlyExpenses}
          onChange={(n) => onChange({ monthlyExpenses: n })}
          prefix="$"
          suffix="/mo"
          min={0}
          step={100}
          help={`${formatMoney(annualExpenses)} per year`}
        />
      </div>

      {/* Stability bucket */}
      <div className="space-y-4">
        <SectionTitle>Stability bucket</SectionTitle>
        <RangeSlider
          label="Buffer size"
          value={params.stabilityYears}
          onChange={(n) => onChange({ stabilityYears: n })}
          min={2}
          max={8}
          unit=" yrs"
          tip="How many years of spending to hold in safe assets. A bigger buffer rides out longer downturns without selling stocks, but too big a buffer drags on long-run growth."
          help="Years of expenses to keep safe — the buffer you live on during a crash."
        />
        <RangeSlider
          label="Cap (% of portfolio)"
          value={params.stabilityCapPct}
          onChange={(n) => onChange({ stabilityCapPct: n })}
          min={20}
          max={50}
          unit="%"
          tip="A ceiling on the stability bucket, as a share of your whole portfolio. The safe bucket is sized at the SMALLER of the buffer (years of expenses) and this cap. Why it matters: early in retirement — or with a smaller portfolio — a fixed number of years of expenses can be a huge slice of your money, leaving too little in stocks to grow. The cap keeps a lid on that. Lower cap → more in the growth bucket (more long-run growth, more short-term risk). Higher cap → a bigger safety cushion, less growth. It only changes anything when the cap is the smaller of the two rules (shown below)."
          help="Ceiling on the safe bucket as a share of the portfolio. Lower = more in stocks; higher = a bigger safe cushion."
        />

        {/* Prominent computed target */}
        <div className="rounded-xl border border-teal/30 bg-teal/5 p-4">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal">
              Stability bucket target
            </p>
            <InfoTooltip label="How the target is computed">
              The smaller of the two rules: {params.stabilityYears} years of expenses (
              {formatMoney(yearsRule)}) vs. {params.stabilityCapPct}% of the portfolio (
              {formatMoney(capRule)}).
            </InfoTooltip>
          </div>
          <p className="mt-1 font-heading text-2xl font-semibold text-teal-dark">
            {formatMoney(target)}
          </p>
          <p className="mt-1 text-xs text-ink/60">
            = min({params.stabilityYears}× expenses, {params.stabilityCapPct}% of portfolio) —{' '}
            <span className="font-medium text-teal-dark">
              {capBinds ? 'the cap is binding' : 'the years rule is binding'}
            </span>
            .
          </p>
        </div>
      </div>

      {/* Market assumptions */}
      <div className="space-y-4">
        <SectionTitle>Market assumptions</SectionTitle>
        <div className="rounded-lg border border-border bg-cream/50 px-3 py-2 text-xs leading-relaxed text-ink/70">
          Returns below are <span className="font-medium text-teal-dark">nominal</span> (before
          inflation). Your <span className="font-medium text-teal-dark">expenses grow with
          inflation every year</span>, so what matters is the gap between them. With the defaults, a
          10% equity return and 6% inflation is a ~4% <em>real</em> return. The results chart lets
          you switch between <span className="font-medium text-teal-dark">Real</span> (today&rsquo;s
          dollars) and <span className="font-medium text-teal-dark">Nominal</span>.
        </div>
        <NumericInput
          label="Expected inflation"
          value={params.inflationPct}
          onChange={(n) => onChange({ inflationPct: n })}
          suffix="%/yr"
          min={0}
          max={15}
          step={0.1}
          help="Drives how fast your expenses (and any Social Security) grow each year."
        />
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label="Equity return"
            value={params.equityReturnPct}
            onChange={(n) => onChange({ equityReturnPct: n })}
            suffix="%"
            min={0}
            max={20}
            step={0.1}
            help="Nominal, before inflation."
          />
          <NumericInput
            label="Equity volatility"
            value={params.equityVolPct}
            onChange={(n) => onChange({ equityVolPct: n })}
            suffix="%"
            min={1}
            max={40}
            step={0.5}
            help="Year-to-year swings."
          />
        </div>
        <NumericInput
          label="Fixed-income return"
          value={params.fixedIncomeReturnPct}
          onChange={(n) => onChange({ fixedIncomeReturnPct: n })}
          suffix="%"
          min={0}
          max={15}
          step={0.1}
          help="Nominal return on the stability bucket (bonds / cash / short-term)."
        />
      </div>

      {/* Maintenance rules */}
      <div className="space-y-4">
        <SectionTitle>Maintenance rules</SectionTitle>
        <NumericInput
          label="Crash-skip threshold"
          value={params.crashSkipThresholdPct}
          onChange={(n) => onChange({ crashSkipThresholdPct: n })}
          suffix="%"
          min={0}
          max={50}
          step={1}
          help="Skip the yearly refill when equities fell by at least this much — don't sell stocks into a crash."
        />

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={params.guardrailsEnabled}
            onChange={(e) => onChange({ guardrailsEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-border accent-teal"
          />
          <span className="flex items-center gap-1.5 text-sm font-medium text-teal-dark">
            Spending guardrails
            <InfoTooltip label="About guardrails">
              Guyton-Klinger-style flexibility: freeze raises after bad years and trim spending when
              the withdrawal rate climbs too high. Research (Blanchett/Morningstar) finds this
              spending flexibility protects a retirement more than the bucket structure itself.
            </InfoTooltip>
          </span>
        </label>

        {params.guardrailsEnabled ? (
          <div className="space-y-4 border-l-2 border-teal/20 pl-4">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={params.guardrailFreezeAfterNegative}
                onChange={(e) => onChange({ guardrailFreezeAfterNegative: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-teal"
              />
              <span className="text-sm text-ink/85">
                Freeze the inflation raise after a negative equity year
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <NumericInput
                label="Cut above WR"
                value={params.guardrailCutRatePct}
                onChange={(n) => onChange({ guardrailCutRatePct: n })}
                suffix="%"
                min={0}
                max={15}
                step={0.1}
                help="Cut spending 10% when the withdrawal rate exceeds this."
              />
              <NumericInput
                label="Restore below WR"
                value={params.guardrailRestoreRatePct}
                onChange={(n) => onChange({ guardrailRestoreRatePct: n })}
                suffix="%"
                min={0}
                max={15}
                step={0.1}
                help="Restore spending when the withdrawal rate falls below this."
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Guaranteed income */}
      <div className="space-y-4">
        <SectionTitle>Other income</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label="Social Security / pension"
            value={params.socialSecurityMonthly}
            onChange={(n) => onChange({ socialSecurityMonthly: n })}
            prefix="$"
            suffix="/mo"
            min={0}
            step={100}
          />
          <NumericInput
            label="Starts in year"
            value={params.socialSecurityStartYear}
            onChange={(n) => onChange({ socialSecurityStartYear: n })}
            suffix="yr"
            min={0}
            max={40}
            step={1}
          />
        </div>
        <p className="flex items-start gap-1.5 text-xs text-ink/60">
          <InfoTooltip label="The Social Security bridge">
            If benefits start years after you retire, you can &ldquo;bridge&rdquo; the gap by
            oversizing the stability bucket to cover those early years — then it shrinks once the
            guaranteed income kicks in. Benefits here are COLA-indexed (they grow with inflation)
            regardless of any spending freezes.
          </InfoTooltip>
          <span>
            Social Security or pension income reduces your net withdrawals from its start year
            onward, and rises with inflation.
          </span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label="Part-time income"
            value={params.partTimeMonthly}
            onChange={(n) => onChange({ partTimeMonthly: n })}
            prefix="$"
            suffix="/mo"
            min={0}
            step={100}
          />
          <NumericInput
            label="for first N years"
            value={params.partTimeYears}
            onChange={(n) => onChange({ partTimeYears: n })}
            suffix="yr"
            min={0}
            max={40}
            step={1}
          />
        </div>
      </div>

      {/* Simulation */}
      <div className="space-y-4">
        <SectionTitle>Simulation</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label="Horizon"
            value={params.horizonYears}
            onChange={(n) => onChange({ horizonYears: n })}
            suffix="yrs"
            min={5}
            max={60}
            step={1}
          />
          <NumericInput
            label="Monte Carlo runs"
            value={params.numRuns}
            onChange={(n) => onChange({ numRuns: n })}
            min={500}
            max={20_000}
            step={500}
          />
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onRun}
          disabled={busy}
          className="w-full rounded-lg bg-amber px-4 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-gold focus-visible:outline-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Running…' : 'Run again (new random draws)'}
        </button>
        <p className="text-center text-xs text-ink/55">
          Results update automatically as you change any input.
        </p>
      </div>
    </div>
  );
}
