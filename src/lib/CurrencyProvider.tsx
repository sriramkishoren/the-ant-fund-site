import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
  formatPercent,
  isCurrencyCode,
  type CurrencyCode,
} from './currency';
import { CurrencyContext, type CurrencyContextValue } from './currency-context';

const STORAGE_KEY = 'taf:currency';
/** Deep links may force a currency, e.g. /tools/fire-calculator?cur=inr */
const URL_PARAM = 'cur';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Always start on the default so the server-rendered HTML and the first
  // client render agree. The stored preference is applied in an effect below,
  // which runs before the tool pages drop their own `mounted` gate — so the
  // calculators never paint in the wrong currency.
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restored: CurrencyCode | null = null;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get(URL_PARAM);
      if (fromUrl && isCurrencyCode(fromUrl.toUpperCase())) {
        restored = fromUrl.toUpperCase() as CurrencyCode;
      } else {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isCurrencyCode(stored)) restored = stored;
      }
    } catch {
      // Private browsing or a blocked storage API — fall back to the default.
    }
    if (restored && restored !== DEFAULT_CURRENCY) setCurrencyState(restored);
    setReady(true);
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // Non-fatal: the choice just won't survive a reload.
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      meta: CURRENCIES[currency],
      setCurrency,
      ready,
      money: (v, withCents = false) => formatMoney(v, currency, withCents),
      moneyCompact: (v) => formatMoneyCompact(v, currency),
      percent: (v) => formatPercent(v, currency),
      number: (v) => formatNumber(v, currency),
    }),
    [currency, setCurrency, ready],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

