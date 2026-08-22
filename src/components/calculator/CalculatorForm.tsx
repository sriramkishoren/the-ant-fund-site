import { useMemo, useState, type FormEvent } from 'react';
import { getMonteCarloDefaults } from '@/features/monte-carlo/defaults';
import { useCurrencyDefaults } from '@/lib/useCurrencyDefaults';
import { useCurrency } from '@/lib/currency-context';
import { LocaleDefaultsPrompt } from '@/components/ui/LocaleDefaultsPrompt';
import { Button } from '@/components/ui/Button';
import { NumberField, SelectField } from '@/components/ui/Field';
import type { SimInputs, WithdrawalStrategy } from '@/features/monte-carlo/types';
import { validate } from '@/features/monte-carlo/validation';

type Props = {
  initial: SimInputs;
  busy: boolean;
  onRun: (inputs: SimInputs) => void;
};

export function CalculatorForm({ initial, busy, onRun }: Props) {
  const { meta } = useCurrency();
  const [values, setValues] = useState<SimInputs>(initial);
  const localeDefaults = useCurrencyDefaults(getMonteCarloDefaults, values, setValues);
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const hasErrors = Object.keys(errors).length > 0;

  function set<K extends keyof SimInputs>(key: K, v: SimInputs[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    if (hasErrors) return;
    onRun(values);
  }

  const err = (k: keyof SimInputs) => (showErrors ? (errors[k] ?? null) : null);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {localeDefaults.stale ? (
        <div className="mb-6">
          <LocaleDefaultsPrompt state={localeDefaults} />
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* About you */}
        <fieldset className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <legend className="px-2 font-heading text-base font-semibold text-teal-dark">
            About you
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Current age"
              value={values.currentAge}
              min={18}
              max={100}
              step={1}
              suffix="yrs"
              onChange={(n) => set('currentAge', n)}
              error={err('currentAge')}
            />
            <NumberField
              label="Retirement age"
              value={values.retirementAge}
              min={values.currentAge + 1}
              max={100}
              step={1}
              suffix="yrs"
              onChange={(n) => set('retirementAge', n)}
              error={err('retirementAge')}
            />
            <NumberField
              label="Life expectancy"
              value={values.lifeExpectancy}
              min={values.retirementAge + 1}
              max={120}
              step={1}
              suffix="yrs"
              className="col-span-2"
              help="How long the plan needs to last."
              onChange={(n) => set('lifeExpectancy', n)}
              error={err('lifeExpectancy')}
            />
          </div>
        </fieldset>

        {/* Saving */}
        <fieldset className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <legend className="px-2 font-heading text-base font-semibold text-teal-dark">
            Saving
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Current portfolio"
              value={values.currentValue}
              min={0}
              step={1000}
              suffix={meta.symbol}
              className="col-span-2"
              onChange={(n) => set('currentValue', n)}
              error={err('currentValue')}
            />
            <NumberField
              label="Monthly contribution"
              value={values.monthlyContribution}
              min={0}
              step={50}
              suffix={meta.symbol}
              onChange={(n) => set('monthlyContribution', n)}
              error={err('monthlyContribution')}
            />
            <NumberField
              label="Annual increase"
              value={values.contributionIncreasePct}
              min={0}
              max={50}
              step={0.5}
              suffix="%"
              help="Raises per year"
              onChange={(n) => set('contributionIncreasePct', n)}
              error={err('contributionIncreasePct')}
            />
          </div>
        </fieldset>

        {/* Returns + inflation */}
        <fieldset className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <legend className="px-2 font-heading text-base font-semibold text-teal-dark">
            Market assumptions
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Expected return"
              value={values.expectedReturnPct}
              min={-10}
              max={30}
              step={0.1}
              suffix="%"
              help="Annual mean"
              onChange={(n) => set('expectedReturnPct', n)}
              error={err('expectedReturnPct')}
            />
            <NumberField
              label="Return volatility"
              value={values.returnStdevPct}
              min={0}
              max={80}
              step={0.5}
              suffix="%"
              help="Annual std. dev."
              tip="How much yearly returns swing around the average. A higher number means bigger booms and busts. As a rough benchmark: US stocks have been around 15% over the long run; bonds closer to 5%; a 60/40 mix sits in between."
              onChange={(n) => set('returnStdevPct', n)}
              error={err('returnStdevPct')}
            />
            <NumberField
              label="Inflation"
              value={values.inflationPct}
              min={-5}
              max={20}
              step={0.1}
              suffix="%"
              className="col-span-2"
              onChange={(n) => set('inflationPct', n)}
              error={err('inflationPct')}
            />
          </div>
        </fieldset>

        {/* Retirement withdrawals */}
        <fieldset className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <legend className="px-2 font-heading text-base font-semibold text-teal-dark">
            Retirement spending
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Strategy"
              value={values.withdrawalStrategy}
              className="col-span-2"
              options={[
                { value: 'fixed-real', label: 'Fixed (inflation-adjusted)' },
                { value: 'fixed-nominal', label: 'Fixed (nominal $)' },
                { value: 'percent-of-portfolio', label: 'Percent of portfolio' },
              ]}
              onChange={(e) =>
                set('withdrawalStrategy', e.target.value as WithdrawalStrategy)
              }
            />
            {values.withdrawalStrategy === 'percent-of-portfolio' ? (
              <NumberField
                label="Withdrawal rate"
                value={values.withdrawalPct}
                min={0}
                max={100}
                step={0.25}
                suffix="%"
                className="col-span-2"
                help="Of portfolio value each year"
                onChange={(n) => set('withdrawalPct', n)}
                error={err('withdrawalPct')}
              />
            ) : (
              <NumberField
                label="Annual withdrawal"
                value={values.annualWithdrawal}
                min={0}
                step={1000}
                suffix={meta.symbol}
                className="col-span-2"
                help={`In today's ${meta.code === 'INR' ? 'rupees' : 'dollars'}`}
                onChange={(n) => set('annualWithdrawal', n)}
                error={err('annualWithdrawal')}
              />
            )}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/60">
          Runs <span className="font-medium text-teal-dark">{values.numSims.toLocaleString()}</span>{' '}
          simulations in your browser. Nothing leaves your device.
        </p>
        <Button type="submit" variant="primary" size="lg" disabled={busy}>
          {busy ? 'Running…' : 'Run simulation'}
        </Button>
      </div>
    </form>
  );
}
