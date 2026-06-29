import { useMemo, useState, type FormEvent } from 'react';
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
  const [values, setValues] = useState<SimInputs>(initial);
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const hasErrors = Object.keys(errors).length > 0;

  function set<K extends keyof SimInputs>(key: K, v: SimInputs[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function num(v: string): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
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
              onChange={(e) => set('currentAge', num(e.target.value))}
              error={err('currentAge')}
            />
            <NumberField
              label="Retirement age"
              value={values.retirementAge}
              min={values.currentAge + 1}
              max={100}
              step={1}
              suffix="yrs"
              onChange={(e) => set('retirementAge', num(e.target.value))}
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
              onChange={(e) => set('lifeExpectancy', num(e.target.value))}
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
              suffix="$"
              className="col-span-2"
              onChange={(e) => set('currentValue', num(e.target.value))}
              error={err('currentValue')}
            />
            <NumberField
              label="Monthly contribution"
              value={values.monthlyContribution}
              min={0}
              step={50}
              suffix="$"
              onChange={(e) => set('monthlyContribution', num(e.target.value))}
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
              onChange={(e) => set('contributionIncreasePct', num(e.target.value))}
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
              onChange={(e) => set('expectedReturnPct', num(e.target.value))}
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
              onChange={(e) => set('returnStdevPct', num(e.target.value))}
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
              onChange={(e) => set('inflationPct', num(e.target.value))}
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
                onChange={(e) => set('withdrawalPct', num(e.target.value))}
                error={err('withdrawalPct')}
              />
            ) : (
              <NumberField
                label="Annual withdrawal"
                value={values.annualWithdrawal}
                min={0}
                step={1000}
                suffix="$"
                className="col-span-2"
                help="In today's dollars"
                onChange={(e) => set('annualWithdrawal', num(e.target.value))}
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
