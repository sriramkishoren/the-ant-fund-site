// Bundled US market history for the dot-com stress test: S&P 500 annual TOTAL
// return (price + dividends reinvested) and US CPI year-over-year inflation,
// 2000–2025.
//
// Why this window: a January 2000 retirement is the canonical US worst case —
// the dot-com crash (2000–2002) immediately followed by the 2008 global
// financial crisis, i.e. two deep bears inside the first decade of retirement.
// It is the sequence-of-returns nightmare, which is exactly what the bucket
// rules are meant to survive.
//
// Sources (rounded to the commonly-published figures):
//  - S&P 500 total return: S&P Dow Jones Indices / Aswath Damodaran's annual
//    returns dataset (NYU Stern), "S&P 500 (includes dividends)".
//  - CPI: US Bureau of Labor Statistics, CPI-U, December-to-December.
//  Values are stored as fractions (−0.091 = −9.1%). 2025 figures are
//  preliminary and may be revised; they do not affect the 2000-decade stress.

export interface HistoricalRow {
  year: number;
  sp500TotalReturn: number; // fraction
  cpiInflation: number; // fraction
}

export const HISTORICAL_US: HistoricalRow[] = [
  { year: 2000, sp500TotalReturn: -0.091, cpiInflation: 0.034 },
  { year: 2001, sp500TotalReturn: -0.1189, cpiInflation: 0.016 },
  { year: 2002, sp500TotalReturn: -0.221, cpiInflation: 0.024 },
  { year: 2003, sp500TotalReturn: 0.2868, cpiInflation: 0.019 },
  { year: 2004, sp500TotalReturn: 0.1088, cpiInflation: 0.033 },
  { year: 2005, sp500TotalReturn: 0.0491, cpiInflation: 0.034 },
  { year: 2006, sp500TotalReturn: 0.1579, cpiInflation: 0.025 },
  { year: 2007, sp500TotalReturn: 0.0549, cpiInflation: 0.041 },
  { year: 2008, sp500TotalReturn: -0.37, cpiInflation: 0.001 },
  { year: 2009, sp500TotalReturn: 0.2646, cpiInflation: 0.027 },
  { year: 2010, sp500TotalReturn: 0.1506, cpiInflation: 0.015 },
  { year: 2011, sp500TotalReturn: 0.0211, cpiInflation: 0.03 },
  { year: 2012, sp500TotalReturn: 0.16, cpiInflation: 0.017 },
  { year: 2013, sp500TotalReturn: 0.3239, cpiInflation: 0.015 },
  { year: 2014, sp500TotalReturn: 0.1369, cpiInflation: 0.008 },
  { year: 2015, sp500TotalReturn: 0.0138, cpiInflation: 0.007 },
  { year: 2016, sp500TotalReturn: 0.1196, cpiInflation: 0.021 },
  { year: 2017, sp500TotalReturn: 0.2183, cpiInflation: 0.021 },
  { year: 2018, sp500TotalReturn: -0.0438, cpiInflation: 0.019 },
  { year: 2019, sp500TotalReturn: 0.3149, cpiInflation: 0.023 },
  { year: 2020, sp500TotalReturn: 0.184, cpiInflation: 0.014 },
  { year: 2021, sp500TotalReturn: 0.2871, cpiInflation: 0.07 },
  { year: 2022, sp500TotalReturn: -0.1811, cpiInflation: 0.065 },
  { year: 2023, sp500TotalReturn: 0.2629, cpiInflation: 0.034 },
  { year: 2024, sp500TotalReturn: 0.2502, cpiInflation: 0.029 },
  { year: 2025, sp500TotalReturn: 0.15, cpiInflation: 0.029 },
];
