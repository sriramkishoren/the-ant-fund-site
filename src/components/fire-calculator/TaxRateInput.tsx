import { NumericField } from '@/components/ui/NumericField';
import { useCurrency } from '@/lib/currency-context';

type Props = {
  value: number; // fraction, e.g. 0.15 = 15%
  onChange: (n: number) => void;
};

export function TaxRateInput({ value, onChange }: Props) {
  const { meta } = useCurrency();

  return (
    <NumericField
      label="Effective tax rate on withdrawals"
      value={value}
      onChange={onChange}
      asPercent
      min={0}
      max={50}
      step={0.5}
      suffix="%"
      help={
        <>
          If you entered your <span className="font-medium text-teal-dark">after-tax</span>{' '}
          spending, we&apos;ll gross it up. {meta.terms.taxHint} Set to 0 if you already entered a
          pre-tax figure.
        </>
      }
    />
  );
}
