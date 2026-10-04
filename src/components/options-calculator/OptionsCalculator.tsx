import { useMemo, useState } from 'react';
import { InputPanel } from './InputPanel';
import { HeadlineCards, DetailTable } from './ResultPanel';
import { PayoffChart } from './PayoffChart';
import { ScenarioTable } from './ScenarioTable';
import { calculateOption } from '@/features/options-calculator/engine';
import { getOptionDefaults } from '@/features/options-calculator/defaults';
import {
  detailMetrics,
  headlineMetrics,
  type Formatters,
} from '@/features/options-calculator/metrics';
import type { OptionInput } from '@/features/options-calculator/types';
import { useCurrency } from '@/lib/currency-context';
import { useCurrencyDefaults } from '@/lib/useCurrencyDefaults';
import { LocaleDefaultsPrompt } from '@/components/ui/LocaleDefaultsPrompt';

export function OptionsCalculator() {
  const { currency, meta, money } = useCurrency();
  const [input, setInput] = useState<OptionInput>(() => getOptionDefaults('long-call', currency));

  const patch = (p: Partial<OptionInput>) => {
    setInput((prev) => {
      // Switching strategy reloads that strategy's starting point rather than
      // carrying over a strike that sits on the wrong side of the price.
      if (p.strategy && p.strategy !== prev.strategy) {
        return getOptionDefaults(p.strategy, currency);
      }
      return { ...prev, ...p };
    });
  };

  const localeDefaults = useCurrencyDefaults(
    (c) => getOptionDefaults(input.strategy, c),
    input,
    setInput,
  );

  const result = useMemo(() => calculateOption(input), [input]);

  const fmt = useMemo<Formatters>(() => {
    const locale = meta.locale;
    const pricer = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: meta.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const pct = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return {
      money: (n) => money(n),
      price: (n) => (Number.isFinite(n) ? pricer.format(n) : '—'),
      percent: (n) => (Number.isFinite(n) ? pct.format(n) : '—'),
    };
  }, [meta.locale, meta.code, money]);

  const headline = useMemo(() => headlineMetrics(result, input, fmt), [result, input, fmt]);
  const detail = useMemo(() => detailMetrics(result, input, fmt), [result, input, fmt]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <LocaleDefaultsPrompt state={localeDefaults} />
          <InputPanel input={input} onChange={patch} />
        </div>

        <div className="space-y-6">
          <HeadlineCards rows={headline} />
          <PayoffChart result={result} input={input} />
          <DetailTable rows={detail} />
          <ScenarioTable result={result} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-cream/50 px-4 py-3 text-xs leading-relaxed text-ink/70">
        <span className="font-medium text-teal-dark">How this model works.</span> Every figure is
        the value <em>at expiration</em> — intrinsic value only. Before expiration an option also
        carries time value, so closing a position early will give a different result. Figures
        exclude commissions, fees, taxes, the bid/ask spread and early assignment.
      </div>

      <div className="rounded-md border border-border bg-cream/50 px-4 py-3 text-xs leading-relaxed text-ink/70">
        <span className="font-medium text-teal-dark">Educational only, not financial advice.</span>{' '}
        This calculator shows the mechanics of a single option position from the numbers you enter.
        It is not a recommendation to buy or sell anything. Options involve real risk of
        substantial loss and are not suitable for every investor.
      </div>
    </div>
  );
}
