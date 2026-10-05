import { useCallback, useEffect, useMemo, useState } from 'react';
import { SelectField } from '@/components/ui/Field';
import { LegEditor } from './LegEditor';
import { MarketPanel } from './MarketPanel';
import { PayoffGraph } from './PayoffGraph';
import { PayoffMatrix } from './PayoffMatrix';
import { SavedStrategies } from './SavedStrategies';
import { GreeksRow, SummaryBar } from './SummaryBar';
import { analysePosition } from '@/features/strategy-builder/engine';
import { buildPreset, defaultMarket, newLeg, PRESETS, type PresetId } from '@/features/strategy-builder/presets';
import {
  deleteStrategy,
  listStrategies,
  loadStrategy,
  saveStrategy,
  type SavedStrategy,
} from '@/features/strategy-builder/storage';
import { encodePosition, readPositionFromUrl, URL_PARAM } from '@/features/strategy-builder/url-state';
import type { Leg, MarketInputs, Position } from '@/features/strategy-builder/types';
import { useCurrency } from '@/lib/currency-context';

type View = 'table' | 'graph';

const PRESET_OPTIONS = PRESETS.map((p) => ({ value: p.id, label: `${p.group} · ${p.label}` }));

export function StrategyBuilder() {
  const { currency } = useCurrency();

  const [preset, setPreset] = useState<PresetId>('cash-secured-put');
  const [position, setPosition] = useState<Position>(() =>
    buildPreset('cash-secured-put', defaultMarket(currency)),
  );
  const [rangePct, setRangePct] = useState(0.3);
  const [view, setView] = useState<View>('table');
  const [saved, setSaved] = useState<SavedStrategy[]>([]);
  const [copied, setCopied] = useState(false);

  // A shared link wins over the default, so an opened link shows that position.
  useEffect(() => {
    const shared = readPositionFromUrl(window.location.search);
    if (shared) setPosition(shared);
    setSaved(listStrategies());
  }, []);

  // Keep the URL in step so the address bar is always the shareable link.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      params.set(URL_PARAM, encodePosition(position));
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    });
    return () => window.cancelAnimationFrame(id);
  }, [position]);

  const result = useMemo(
    () => analysePosition(position, { rangePct, rows: 19, columns: 13 }),
    [position, rangePct],
  );

  const applyPreset = (id: PresetId) => {
    setPreset(id);
    setPosition((prev) => buildPreset(id, prev.market));
  };

  const patchMarket = (patch: Partial<MarketInputs>) =>
    setPosition((prev) => ({ ...prev, market: { ...prev.market, ...patch } }));

  const patchLeg = (id: string, patch: Partial<Leg>) =>
    setPosition((prev) => ({
      ...prev,
      legs: prev.legs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));

  const removeLeg = (id: string) =>
    setPosition((prev) => ({ ...prev, legs: prev.legs.filter((l) => l.id !== id) }));

  const addLeg = () =>
    setPosition((prev) => ({ ...prev, legs: [...prev.legs, newLeg(prev.market)] }));

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable; the URL bar still holds the link.
    }
  }, []);

  const presetBlurb = PRESETS.find((p) => p.id === preset)?.blurb;

  return (
    <div className="space-y-6">
      <SummaryBar result={result} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <SelectField
              label="Strategy"
              value={preset}
              onChange={(e) => applyPreset(e.target.value as PresetId)}
              options={PRESET_OPTIONS}
              help="Picking one replaces the legs below. Edit them freely afterwards."
            />
            {presetBlurb ? (
              <p className="rounded-lg border border-border bg-cream/50 px-3 py-2 text-xs leading-relaxed text-ink/75">
                {presetBlurb}
              </p>
            ) : null}
          </div>

          <MarketPanel
            market={position.market}
            onChange={patchMarket}
            rangePct={rangePct}
            onRangeChange={setRangePct}
          />
          <LegEditor
            legs={position.legs}
            onChange={patchLeg}
            onRemove={removeLeg}
            onAdd={addLeg}
          />
          <SavedStrategies
            saved={saved}
            onSave={(name) => setSaved(saveStrategy(name, position))}
            onLoad={(entry) => {
              const p = loadStrategy(entry);
              if (p) setPosition(p);
            }}
            onDelete={(id) => setSaved(deleteStrategy(id))}
            onCopyLink={copyLink}
            copied={copied}
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {(['table', 'graph'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-teal ${
                  view === v
                    ? 'bg-teal text-white'
                    : 'border border-border bg-surface text-ink/70 hover:bg-cream'
                }`}
              >
                {v}
              </button>
            ))}
            {!result.singleExpiry ? (
              <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-medium text-amber">
                Legs expire on different dates — analysed to the nearest expiry
              </span>
            ) : null}
          </div>

          {view === 'table' ? (
            <PayoffMatrix result={result} />
          ) : (
            <PayoffGraph result={result} spot={position.market.spot} />
          )}

          <GreeksRow result={result} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-cream/50 px-4 py-3 text-xs leading-relaxed text-ink/70">
        <span className="font-medium text-teal-dark">How this model works.</span> Values before
        expiration come from Black–Scholes, which prices European exercise — early assignment,
        common on in-the-money puts and around dividends, is not modelled. Volatility is one number
        per leg rather than a surface, dividends are a continuous yield, and commissions, fees and
        the bid/ask spread are excluded. Premiums you have not edited are rough stand-ins, not
        quotes.
      </div>

      <div className="rounded-md border border-border bg-cream/50 px-4 py-3 text-xs leading-relaxed text-ink/70">
        <span className="font-medium text-teal-dark">Educational only, not financial advice.</span>{' '}
        This tool shows the mechanics of a position from the numbers you enter. It is not a
        recommendation to buy or sell anything. Options involve a real risk of substantial loss and
        are not suitable for every investor.
      </div>
    </div>
  );
}
