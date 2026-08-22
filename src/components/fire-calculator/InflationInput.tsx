import { NumericField } from '@/components/ui/NumericField';

type Props = {
  value: number; // fraction, e.g. 0.03 = 3%
  onChange: (n: number) => void;
};

export function InflationInput({ value, onChange }: Props) {
  return (
    <NumericField
      label="Assumed inflation"
      value={value}
      onChange={onChange}
      asPercent
      min={0}
      max={15}
      step={0.1}
      suffix="%/yr"
      help={
        <>
          Only used for the nominal-at-retirement projection. The long-run US average is about{' '}
          <span className="font-medium text-teal-dark">3%</span>; India runs nearer{' '}
          <span className="font-medium text-teal-dark">6%</span>.
        </>
      }
    />
  );
}
