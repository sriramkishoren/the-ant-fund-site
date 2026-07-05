import { SelectField } from '@/components/ui/Field';
import { NumericInput } from './NumericInput';
import { SolvedField } from './SolvedField';
import type {
  CompoundingFrequency,
  ContributionFrequency,
  ContributionTiming,
  InvestmentInput,
  SolveFor,
} from '@/features/investment-calculator/types';

const SOLVE_OPTIONS: { value: SolveFor; label: string }[] = [
  { value: 'endAmount', label: 'End balance' },
  { value: 'contribution', label: 'Required contribution' },
  { value: 'return', label: 'Required return' },
  { value: 'startingAmount', label: 'Required starting amount' },
  { value: 'time', label: 'Time to reach goal' },
];

const CONTRIB_FREQ_OPTIONS: { value: ContributionFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const TIMING_OPTIONS: { value: ContributionTiming; label: string }[] = [
  { value: 'end', label: 'End of period' },
  { value: 'beginning', label: 'Beginning of period' },
];

const COMPOUNDING_OPTIONS: { value: CompoundingFrequency; label: string }[] = [
  { value: 'annually', label: 'Annually' },
  { value: 'semiannually', label: 'Semi-annually' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
];

type Props = {
  input: InvestmentInput;
  onChange: (patch: Partial<InvestmentInput>) => void;
  solveFor: SolveFor;
  onSolveForChange: (s: SolveFor) => void;
  targetEndAmount: number;
  onTargetChange: (n: number) => void;
  solvedValue: number | null;
};

export function InputPanel({
  input,
  onChange,
  solveFor,
  onSolveForChange,
  targetEndAmount,
  onTargetChange,
  solvedValue,
}: Props) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <SelectField
        label="Solve for"
        value={solveFor}
        onChange={(e) => onSolveForChange(e.target.value as SolveFor)}
        options={SOLVE_OPTIONS}
        help="Pick the unknown. The chosen field becomes the answer; everything else stays an input."
      />

      {solveFor !== 'endAmount' ? (
        <NumericInput
          label="Goal (target end balance)"
          value={targetEndAmount}
          onChange={onTargetChange}
          prefix="$"
          min={0}
          step={1000}
        />
      ) : null}

      <hr className="border-border" />

      {/* Starting amount */}
      {solveFor === 'startingAmount' ? (
        <SolvedField label="Required starting amount" kind="currency" value={solvedValue} />
      ) : (
        <NumericInput
          label="Starting amount"
          value={input.startingAmount}
          onChange={(n) => onChange({ startingAmount: n })}
          prefix="$"
          min={0}
          step={1000}
        />
      )}

      {/* Contribution */}
      {solveFor === 'contribution' ? (
        <SolvedField
          label={`Required contribution (${input.contributionFrequency})`}
          kind="currency"
          value={solvedValue}
        />
      ) : (
        <NumericInput
          label="Additional contribution"
          value={input.contribution}
          onChange={(n) => onChange({ contribution: n })}
          prefix="$"
          min={0}
          step={50}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Contribution frequency"
          value={input.contributionFrequency}
          onChange={(e) =>
            onChange({ contributionFrequency: e.target.value as ContributionFrequency })
          }
          options={CONTRIB_FREQ_OPTIONS}
        />
        <SelectField
          label="Contribution timing"
          value={input.contributionTiming}
          onChange={(e) =>
            onChange({ contributionTiming: e.target.value as ContributionTiming })
          }
          options={TIMING_OPTIONS}
        />
      </div>

      {/* Return */}
      {solveFor === 'return' ? (
        <SolvedField label="Required annual return" kind="percent" value={solvedValue} />
      ) : (
        <NumericInput
          label="Expected annual return"
          value={input.annualReturn}
          onChange={(n) => onChange({ annualReturn: n })}
          asPercent
          suffix="%/yr"
          min={-50}
          max={100}
          step={0.1}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Years */}
        {solveFor === 'time' ? (
          <SolvedField label="Time to reach goal" kind="years" value={solvedValue} />
        ) : (
          <NumericInput
            label="Investment length"
            value={input.years}
            onChange={(n) => onChange({ years: n })}
            suffix="yrs"
            min={1}
            max={100}
            step={1}
          />
        )}
        <SelectField
          label="Compounding frequency"
          value={input.compounding}
          onChange={(e) => onChange({ compounding: e.target.value as CompoundingFrequency })}
          options={COMPOUNDING_OPTIONS}
        />
      </div>
    </div>
  );
}
