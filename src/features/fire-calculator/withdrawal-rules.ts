// Strategy interface for withdrawal rules. The simulation loop calls
// rule.compute(ctx) and uses the returned dollar amount — it never branches on
// rule.kind. Adding a sixth rule is a one-file change in ./rules/ plus a
// one-line entry in the WITHDRAWAL_RULES map below.

import { fixedRealRule } from './rules/fixed-real';
import { riskBasedGuardrailsRule } from './rules/risk-based-guardrails';
import { guytonKlingerRule } from './rules/guyton-klinger';
import { vpwRule } from './rules/vpw';
import { rmdRule } from './rules/rmd';
import type { WithdrawalRuleKind } from './types';

export interface WithdrawalContext {
  /** 0-based year index since retirement (sim year 0). */
  yearIndex: number;
  /** Current age this year (= retirementAge + yearIndex). */
  age: number;
  /** Portfolio value at the START of this year, before withdrawal. */
  portfolioValue: number;
  /** Cumulative inflation factor since sim year 0 (e.g. 1.30 = +30%). */
  inflationToDate: number;
  /** Initial withdrawal rate (rule.initialRate). */
  initialRate: number;
  /** Real (today's-dollar) annual spending target. */
  baseRealSpending: number;
  /** Cash flows already injected for this year (today's dollars). */
  cashFlowsThisYear: number;
  /** Years left in the horizon, this year inclusive. */
  remainingHorizonYears: number;
  /** Rule-specific params from rule.params. */
  params: Record<string, number>;
}

export interface WithdrawalRuleImpl {
  kind: WithdrawalRuleKind;
  displayName: string;
  shortDescription: string;
  /** Returns the dollar withdrawal for this year (nominal). */
  compute: (ctx: WithdrawalContext) => number;
}

export const WITHDRAWAL_RULES: Record<WithdrawalRuleKind, WithdrawalRuleImpl> = {
  'fixed-real': fixedRealRule,
  'risk-based-guardrails': riskBasedGuardrailsRule,
  'guyton-klinger': guytonKlingerRule,
  vpw: vpwRule,
  rmd: rmdRule,
};

export function getRule(kind: WithdrawalRuleKind): WithdrawalRuleImpl {
  const rule = WITHDRAWAL_RULES[kind];
  if (!rule) throw new Error(`Unknown withdrawal rule: ${kind}`);
  return rule;
}
