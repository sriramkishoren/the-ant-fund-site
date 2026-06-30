// Shape of public/data/shiller.json — produced by scripts/build-shiller-dataset.ts.
// This is the engine's contract; don't change the shape without regenerating
// the JSON.

export interface ShillerMonthlyRow {
  /** ISO yyyy-mm. */
  date: string;
  /** Monthly real total return on the S&P 500, expressed as a percent. */
  sp500RealReturnPct: number;
  /** Monthly real total return on intermediate Treasuries, percent. */
  bondRealReturnPct: number;
  /** CPI index level (1982 = 100). */
  cpi: number;
  /** Shiller cyclically-adjusted price-to-earnings ratio. */
  cape: number;
}

export interface ShillerDataset {
  /** ISO yyyy-mm of the last row. */
  asOf: string;
  rows: ShillerMonthlyRow[];
  meta: {
    source: 'shiller-online' | 'synthetic-facsimile';
    sourceUrl: string;
    generatedAt: string;
    generatorScript: string;
    note?: string;
  };
}
