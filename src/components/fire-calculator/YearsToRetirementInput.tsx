import { NumericField } from '@/components/ui/NumericField';

type Props = {
  value: number;
  onChange: (n: number) => void;
};

export function YearsToRetirementInput({ value, onChange }: Props) {
  return (
    <NumericField
      label="Years until retirement"
      value={value}
      onChange={onChange}
      min={0}
      max={60}
      step={1}
      inputMode="numeric"
      suffix="yrs"
      help={
        <>
          Leave at <span className="font-medium text-teal-dark">0</span> if you&apos;re retiring
          now. Otherwise we&apos;ll also show the inflated nominal target.
        </>
      }
    />
  );
}
