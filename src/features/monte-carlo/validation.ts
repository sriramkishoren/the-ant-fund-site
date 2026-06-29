import type { SimInputs } from './types';

export type Errors = Partial<Record<keyof SimInputs, string>>;

export function validate(inputs: SimInputs): Errors {
  const e: Errors = {};
  if (inputs.currentAge < 18 || inputs.currentAge > 100) e.currentAge = 'Must be 18–100.';
  if (inputs.retirementAge <= inputs.currentAge)
    e.retirementAge = 'Must be greater than current age.';
  if (inputs.lifeExpectancy <= inputs.retirementAge)
    e.lifeExpectancy = 'Must be greater than retirement age.';
  if (inputs.lifeExpectancy > 120) e.lifeExpectancy = 'Must be 120 or less.';
  if (inputs.currentValue < 0) e.currentValue = 'Cannot be negative.';
  if (inputs.monthlyContribution < 0) e.monthlyContribution = 'Cannot be negative.';
  if (inputs.contributionIncreasePct < 0)
    e.contributionIncreasePct = 'Cannot be negative.';
  if (inputs.contributionIncreasePct > 50)
    e.contributionIncreasePct = 'Unrealistically high.';
  if (inputs.inflationPct < -5 || inputs.inflationPct > 20)
    e.inflationPct = 'Must be between -5 and 20%.';
  if (inputs.expectedReturnPct < -10 || inputs.expectedReturnPct > 30)
    e.expectedReturnPct = 'Must be between -10 and 30%.';
  if (inputs.returnStdevPct < 0 || inputs.returnStdevPct > 80)
    e.returnStdevPct = 'Must be between 0 and 80%.';
  if (inputs.annualWithdrawal < 0) e.annualWithdrawal = 'Cannot be negative.';
  if (inputs.withdrawalPct < 0 || inputs.withdrawalPct > 100)
    e.withdrawalPct = 'Must be between 0 and 100%.';
  return e;
}
