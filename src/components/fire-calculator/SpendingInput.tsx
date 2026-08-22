import { NumericField } from '@/components/ui/NumericField';
import { useCurrency } from '@/lib/currency-context';

type Props = {
  value: number;
  onChange: (n: number) => void;
};

export function SpendingInput({ value, onChange }: Props) {
  const { meta, money } = useCurrency();

  return (
    <NumericField
      label="Annual spending in retirement"
      value={value}
      onChange={onChange}
      min={0}
      step={meta.steps.medium}
      prefix={meta.symbol}
      suffix="/yr"
      inputClassName="py-3 text-lg font-medium"
      help={
        <>
          <span className="font-medium text-teal-dark">
            In today&apos;s {meta.terms.noun}
          </span>{' '}
          — what your retirement lifestyle would cost if you started living it this year (about{' '}
          <span className="font-medium text-teal-dark">{money(value / 12)}</span> a month). The
          headline FIRE number comes out in today&apos;s {meta.terms.noun} too.
        </>
      }
    />
  );
}
