import { useMemo, useState } from 'react';
import { InputPanel } from './InputPanel';
import { ResultCards } from './ResultCards';
import { GrowthChart } from './GrowthChart';
import { BreakdownDonut } from './BreakdownDonut';
import { YearTable } from './YearTable';
import { ScenarioComparison, type Scenario } from './ScenarioComparison';
import { EducationalFooter } from './EducationalFooter';
import { resolvePlan } from '@/features/investment-calculator/engine';
import {
  DEFAULT_INVESTMENT_INPUT,
  DEFAULT_TARGET_END_AMOUNT,
} from '@/features/investment-calculator/defaults';
import type {
  ContributionFrequency,
  InvestmentInput,
  SolveFor,
} from '@/features/investment-calculator/types';
import { formatCurrency, formatPercent } from '@/lib/format';

const SCENARIO_COLORS = ['#15807D', '#E09A33', '#0D5957'];
const FREQ_ABBREV: Record<ContributionFrequency, string> = {
  monthly: 'mo',
  quarterly: 'qtr',
  annually: 'yr',
};

export function InvestmentCalculator() {
  const [input, setInput] = useState<InvestmentInput>(DEFAULT_INVESTMENT_INPUT);
  const [solveFor, setSolveFor] = useState<SolveFor>('endAmount');
  const [targetEndAmount, setTargetEndAmount] = useState<number>(DEFAULT_TARGET_END_AMOUNT);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const { value: solvedValue, resolvedInput, result } = useMemo(
    () => resolvePlan(solveFor, input, targetEndAmount),
    [solveFor, input, targetEndAmount],
  );

  const patch = (p: Partial<InvestmentInput>) => setInput((prev) => ({ ...prev, ...p }));

  const canPin = scenarios.length < 3 && result !== null;

  function pinCurrent() {
    if (!result) return;
    const color = SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length];
    const label = `${formatCurrency(resolvedInput.contribution)}/${
      FREQ_ABBREV[resolvedInput.contributionFrequency]
    } · ${formatPercent(resolvedInput.annualReturn)} · ${Math.round(resolvedInput.years)}yr`;
    setScenarios((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, label, color, input: resolvedInput, result },
    ]);
  }

  function removeScenario(id: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <InputPanel
            input={input}
            onChange={patch}
            solveFor={solveFor}
            onSolveForChange={setSolveFor}
            targetEndAmount={targetEndAmount}
            onTargetChange={setTargetEndAmount}
            solvedValue={solvedValue}
          />
        </div>

        <div className="space-y-6">
          {result ? (
            <>
              <ResultCards result={result} />
              <GrowthChart input={resolvedInput} result={result} />
              <BreakdownDonut result={result} />
            </>
          ) : (
            <div className="rounded-2xl border border-amber/40 bg-amber/5 p-8 text-center">
              <p className="font-heading text-lg text-teal-dark">This goal isn&rsquo;t reachable</p>
              <p className="mt-2 text-sm text-ink/70">
                With the current inputs there&rsquo;s no value that hits{' '}
                {formatCurrency(targetEndAmount)}. Try a longer horizon, a higher return, or a
                larger contribution — or lower the goal.
              </p>
            </div>
          )}
        </div>
      </div>

      <ScenarioComparison
        scenarios={scenarios}
        onPinCurrent={pinCurrent}
        onRemove={removeScenario}
        canPin={canPin}
      />

      {result ? <YearTable result={result} /> : null}

      <EducationalFooter />
    </div>
  );
}
