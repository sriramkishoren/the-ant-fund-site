---
title: "The Wheel: a foundations guide to selling options for income"
date: "2026-06-28"
category: "Options"
tags: [options, the-wheel, premium-selling, covered-call, cash-secured-put, greeks]
excerpt: "What calls and puts actually are, how the Wheel strategy generates income, and where premium selling really earns — a careful look at the math behind options income."
description: "Calls, puts, the four positions, the Wheel strategy, the Greeks, and intrinsic vs. extrinsic value — a foundation guide to selling options for income."
featuredImage: "/blog/hero/the-wheel-options-foundations-hero.svg"
featuredImageAlt: "Abstract diagram of the Wheel cycle — coin shapes connected by curved arrows in teal and amber on cream"
---

If you have ever opened an options chain, your first reaction was probably the same as everyone else's: a wall of numbers, none of which clearly explained what you would *get* and what you would *owe*. This post fixes that — not by giving you a trade to copy, but by walking through what options actually are, how a specific income strategy called **the Wheel** works, and where the real money in premium selling comes from (it's almost never what the headline premium suggests).

Everything below is built around one running example: **NVIDIA (NVDA) at a spot price of $192.71** — the June 26, 2026 close, about 10% off recent highs, sitting comfortably in a 52-week range of roughly $151–$237. Every premium, delta, and dollar amount is *illustrative* — designed to teach the mechanics, not to be a live quote. When you sit in front of a real chain, re-read the actual numbers and redo the arithmetic from scratch.

> **A note on what this is.** This is education about how an instrument works, not financial advice and not a trading recommendation. Premium selling is *not* free money. The downside is real and is kept visible throughout — the −$18,050 worst case on the cash-secured-put example is not hypothetical politeness. If after reading you decide options are not for you, that is a perfectly good outcome.

In the Wheel strategy, **you are always the seller.** The buyer on the other side wants a right; you take an obligation in exchange for cash. That asymmetry is the entire game.

## What an option actually is

Before anything else, three words that show up on every options page:

- **Long** — you *bought* the position (you paid money for it).
- **Short** — you *sold* the position (you received money for it).
- **Premium** — the price of the option, paid by the buyer to the seller up front and kept by the seller no matter what.

Throughout the Wheel, you are always **short** — you sell options and collect premium. With those three words in hand, the definition is straightforward:

An **option** is a contract over **100 shares.** One contract equals 100 shares — that "100" is the most common units mistake to avoid. The buyer pays a premium for a *right*. The seller receives the premium and takes on an *obligation*.

That asymmetry is what makes the seller's job feel a lot like running an insurance company. You collect the premium today; you want the policy to expire unused.

Two more terms are needed immediately:

- **Strike** — the agreed transaction price.
- **Expiration** — the date the right ends.

One important wrinkle: US equity options are **American-style** — the buyer can exercise on any day before expiration, not only on the last day. As a seller you can therefore be assigned *early*, which matters especially around dividends and for deep in-the-money positions. (A *dividend* is a cash payment a company periodically makes to shareholders; the *ex-dividend date* is the cutoff — you must own shares the day before to collect it. A buyer holding an in-the-money call on a dividend-paying stock may exercise just before that date to capture the dividend, which forces you, the seller, to deliver shares early.)

## The four positions: calls, puts, long, short

There are exactly **two contract types** — call and put — and **two sides** — long (you bought it) and short (you sold it). That gives four combinations:

| Position | You... | Right or obligation | You want the stock to... | Wheel role |
|---|---|---|---|---|
| Long call | pay premium | right to **buy** 100 @ strike | rise a lot | (not used) |
| **Short call** | **collect premium** | obligated to **sell** 100 @ strike if assigned | stay flat or drift up to the strike | **Covered call** |
| Long put | pay premium | right to **sell** 100 @ strike | fall a lot | (not used) |
| **Short put** | **collect premium** | obligated to **buy** 100 @ strike if assigned | stay flat or rise | **Cash-secured put** |

The intuition behind each contract type, in one line each:

- A **call** gives the right to *buy*, so it has value when the strike is *cheaper* than the market price.
- A **put** gives the right to *sell*, so it has value when the strike is *richer* than the market price.

The Wheel only uses the two **short** positions — the cash-secured put and the covered call. The picture below shows what those payoffs look like at expiration:

![Two payoff diagrams showing how a short call profits when the price stays at or below the strike (and loses as price rises), and a short put profits when the price stays at or above the strike (and loses as price falls)](/blog/inline/the-wheel-short-payoffs.svg)

Read both diagrams the same way: the flat line at the top is the premium you keep; the diagonal line is where the obligation kicks in and starts costing you. Maximum profit is the premium received. Maximum loss is large in both cases — unlimited on the short call in theory (the stock can keep rising), and almost the full strike on the short put (the stock can go to zero).

## Worked example A — the cash-secured put

**Setup:** NVDA at $192.71. You **sell 1 put, strike $185, ~35 DTE** (days to expiration), for an illustrative premium of **$4.50**. That premium is quoted *per share*, but each contract covers 100 shares, so the cash actually changing hands is the quote × 100 — **$450 cash today, in your account.** The same rule applies to every dollar figure in an option chain: always multiply by 100 to get real money.

The numbers:

- **Cash secured** = strike × 100 = $185 × 100 = **$18,500** set aside. *Why this amount?* If you're assigned, you must buy 100 shares at $185 each — your broker locks up exactly that cash so the trade can settle no matter what. That is what "cash-secured" means: the worst case is fully pre-funded. No naked risk, no margin call.
- **Premium received** = $450, kept no matter what.
- **Breakeven** = strike − premium per share = $185 − $4.50 = **$180.50.**
- **Max profit** = $450, if NVDA closes ≥ $185 at expiration (the put expires worthless).
- **Return on secured capital** if it expires worthless = $450 / $18,500 = **2.43% over 35 days.** Annualized for comparison, that is 2.43% × (365 / 35) ≈ **25.4% per year.** *Annualizing* just scales a short-period return up to a full-year figure (here, about 10 such 35-day cycles per year) so trades of different lengths become comparable. It is a useful yardstick — but treat it skeptically. It assumes flawless repetition with no assignments and no losses, which never holds.

**The full payoff at expiration — five regions to memorize:**

| NVDA at expiration | Outcome | P/L | Effective share basis |
|---|---|---|---|
| ≥ $185 | Put expires worthless | **+$450** (max) | — |
| $180.50 – $185 | Assigned at $185 | between $0 and +$450 | $180.50 |
| = $180.50 | Assigned (breakeven) | **$0** | $180.50 |
| < $180.50 | Assigned, net loss | (S − 185) × 100 + 450 | $180.50 |
| → $0 (tail) | Assigned, near-total loss | **−$18,050** | $180.50 |

**Spot-check at NVDA = $182:** you're assigned at $185 (paper loss $3/share = −$300) but you keep $450 of premium → net **+$150.** Or, equivalently: effective basis $180.50, stock at $182 → +$1.50 × 100 = +$150. Same answer, two ways. Both views are worth being able to check in your head.

**Advantages.** You get paid to set a limit-buy *below* the market; if assigned, you own a name you wanted at a discount to today's price ($180.50 vs. $192.71).

**Disadvantages.** Upside is capped at the premium while downside runs nearly to zero — the **−$18,050 tail** is the honest risk. You also forgo gains if NVDA rallies; you only ever collect $450.

## Worked example B — the covered call

**Setup:** you already own 100 NVDA at a **cost basis of $170** (cost basis = the per-share price you actually paid for the shares you currently hold; every profit or loss on those shares is measured against this number). NVDA is now $192.71. You **sell 1 call, strike $205, ~35 DTE**, for an illustrative **$4.00 per share = $400 per contract.**

**Rule applied:** *strike ≥ cost basis* → $205 ≥ $170 ✓. So you are never forced to lock in a loss.

| NVDA at expiration | Outcome | Total P/L (including premium) |
|---|---|---|
| < $205 | Call expires worthless; keep shares + premium | **+$400** plus whatever the shares did |
| ≥ $205 | Called away at $205 | (205 − 170) × 100 + 400 = **+$3,900** (capped) |
| Falls to $160 | Call worthless; you still hold the shares | unrealized (160 − 170) × 100 + 400 = **−$600** |

**Advantages.** The $400 premium lowers your effective basis to $166 and pays you to wait; if you are called away, it is a *planned win* at a chosen price.

**Disadvantages.** Upside is **capped at $205** — if NVDA gaps to $230 you still sell at $205 (the opportunity cost vs. buy-and-hold). The premium only cushions $4 of downside; underlying stock risk is essentially unchanged. A covered call is a **slightly-bullish-to-neutral** position; it is *not* a hedge.

## The Wheel, one full cycle end to end

**In one sentence:** sell a cash-secured put → (maybe) get assigned 100 shares → sell a covered call against them → (maybe) get called away → back to selling a cash-secured put.

You collect premium at every step. **Assignment is a planned gear-change, not a failure.** The plan only breaks if you sell a put on a stock you were never actually willing to own.

![Diagram of the Wheel as a four-step repeating cycle: sell a cash-secured put, get assigned, sell a covered call, get called away, return to selling a cash-secured put — with premium collected at each step](/blog/inline/the-wheel-cycle.svg)

The mechanical cycle:

1. **Sell a cash-secured put** on a name you would be happy to own at the strike.
2. **If assigned**, you now own 100 shares; record cost basis = strike − premium received. Begin selling covered calls at or above that basis.
3. **If called away**, you return to cash; record the gain.
4. **Repeat** with a fresh cash-secured put.

### A worked end-to-end turn of the Wheel

Stitching the CSP and CC examples above into a single cycle (still illustrative):

| Step | Action | Cash flow | Position after |
|---|---|---|---|
| 1 | Sell $185 CSP, 35 DTE, for $4.50 | **+$450** premium; $18,500 locked | Short 1 put; basis if assigned = $180.50 |
| 2 | NVDA drifts to $178 by expiration → assigned | $18,500 cash → 100 shares at $185 | Own 100 NVDA at **effective basis $180.50** |
| 3 | Sell $185 CC, 35 DTE, for $3.00 (strike = basis, never below) | **+$300** premium | Short 1 call; if called away, sell at $185 |
| 4 | NVDA rallies to $190 by expiration → called away | 100 shares → $18,500 cash | Back to cash |
| **Totals** | One full Wheel turn over ~70 days | **+$750 in premium** — shares bought and sold at $185 (net $0 on the shares) | Ready to start a new cycle |

The shares themselves netted exactly zero (bought at $185, sold at $185), but you collected **$750** in premium across the cycle. *That* is the engine. Step 2 *feels* like a loss in the moment — you got assigned below the strike — but the planned basis of $180.50 plus the step-3 income absorb it. The Wheel only "breaks" if you sold the original CSP on a stock you weren't actually willing to own at that price.

## Reading an options chain

> Heads-up: this section uses **delta**, **theta**, **vega**, **gamma**, and **IV / IV Rank** as column labels before they are defined. For now, treat them as labels — full definitions are in [The Greeks](#the-greeks-for-income-selling) below. You can skim this section and come back if anything feels opaque.

A broker's option chain is a grid: expirations down, strikes across the middle, calls on the left, puts on the right.

| Element | Where it is | What to know |
|---|---|---|
| Symbol entry | Trade tab → type NVDA | Opens the full chain |
| Expirations | Collapsible header rows, e.g. `JUL 31 26 (35)` | Parenthetical = DTE; live in the ~30–45 DTE rows; ignore *weeklies* at first (options that expire every Friday rather than the standard monthly third-Friday cycle — their short lifespan makes gamma risk much worse) |
| Calls / Puts | Calls left, puts right | Same strikes, mirrored |
| Strikes | Down the middle | A horizontal line marks the at-the-money region (current price) |
| Put moneyness | Strikes below spot = OTM (what you sell); above spot = ITM | A put-seller works strikes *below* $192.71 |
| Call moneyness | Strikes above spot = OTM (what you sell); below spot = ITM | Mirror of puts |

### Columns worth displaying — a seller's priority order

Right-click any column header → Customize, then add:

| Column | What it is | What it tells a seller |
|---|---|---|
| **Bid / Ask / Mark** | Sell price / buy price / midpoint | You sell at the bid, buy at the ask; target a limit at the **Mark** |
| **Bid–ask spread** | Ask − Bid | Liquidity tell: $0.03–$0.10 is fine on NVDA; ~$0.50 is wide and you bleed on entry and exit |
| **Delta** | Directional + probability proxy | Pick your assignment odds (target 0.20–0.30) |
| **Theta** | Daily time decay | Your daily income engine; works *for* the seller |
| **Vega** | Sensitivity to implied volatility | You are short vega — sell when IV is rich |
| **Gamma** | Rate of change of delta | Risk that bites near expiration or at the strike |
| **Prob OTM** | Model odds the option expires out of the money | ≈ chance you keep the full premium |
| **Open Interest / Volume** | Outstanding contracts / today's trades | Higher = tighter spreads, easier rolls |
| **Impl Vol** | The option's implied volatility | Pair with **IV Rank** to judge rich vs. cheap *for NVDA* |

### Reading one row — the JUL (35 DTE) $185 put

| Field | Value | Translation |
|---|---|---|
| Bid / Ask / Mark | 4.40 / 4.60 / **4.50** | Market pays ~$450 to take the obligation |
| Delta | **−0.27** | ~27% assignment odds; behaves like ~27 shares |
| Theta | **+0.12** | ~$12/day of decay accrues to you |
| Vega | **0.20** | A 5-point IV drop ≈ +$100 to your position |
| Gamma | **0.012** | Small at 35 DTE; grows near expiry |
| Prob OTM | **73%** | ~73% chance of keeping the full $450 |
| Open Interest | **8,400** | Liquid — tight spread, easy to roll |

### Placing the sale

| Step | Action | Check |
|---|---|---|
| 1 | Right-click the **bid** → Sell → Single | Drops a `SELL −1 LIMIT` into Order Entry |
| 2 | Set limit = **4.50** (the Mark) | Never market-order an option |
| 3 | Confirm **Buying Power Effect** ≈ **$18,500** | Proves it's cash-secured, not naked / on margin |
| 4 | (Optional best practice) | Stage a GTC buy-to-close at 50% right after the fill |

**General rule:** always work a **limit order** at or near the Mark — never market-order an option. The Mark (midpoint of bid and ask) is your realistic target fill.

## The Greeks for income selling

The **Greeks** are sensitivity numbers — each one measures how the option's price changes when one input (stock price, time, volatility) moves by one unit. Brokers display them from the *option buyer's* perspective by default: theta shows as negative because every day chips a little value off what the buyer paid; vega shows as positive because rising volatility makes the buyer's contract worth more.

**The crucial reframe:** when you *short* an option, every Greek flips sign relative to the option's own Greek. The buyer's loss is your gain, line by line. The buyer's negative theta becomes your daily income. The buyer's vega risk becomes the IV-crush opportunity for you. Read the rest of this section through that flip.

### A seller's-eye view of the $185 short put

| Greek | Option's value | Your short-put position | Meaning to you |
|---|---|---|---|
| **Delta** | −0.27 | **+0.27** | Directional + rough probability proxy |
| **Theta** | −0.12/day | **+$12/day** | Time decay works *for* you |
| **Vega** | +0.20 | **−0.20** (short vega) | You profit when IV *falls* |
| **Gamma** | +0.012 | **−0.012** (short gamma) | Your enemy near expiration / at the strike |

### Each Greek — its edge and its catch

| Greek | What it is | The edge for a seller | The catch |
|---|---|---|---|
| **Delta** | Directional exposure; ‖delta‖ ≈ risk-neutral prob. of finishing ITM (*risk-neutral* here = priced as if no one demands extra return for taking risk; close enough to real-world odds for sizing decisions) | A 0.27 put ≈ ~27% assignment odds, ~73% keep-it-all; lets you *choose* your odds (target 0.20–0.30) | It is risk-neutral (real-world odds differ slightly due to the equity risk premium) and it *moves* as the stock moves — a snapshot, not a guarantee |
| **Theta** | Daily decay of **extrinsic** value | You're long theta (~+$12/day); this decay *is* how you earn the premium | Non-linear — accelerates near expiry (~∝ 1/√(time left) for ATM), and that acceleration drags gamma along with it |
| **Gamma** | Rate of change of delta | Small and manageable at 35 DTE | You're short gamma: a sharp move makes delta worsen *faster and faster*; it explodes in the final week — the real reason to favor 30–45 DTE over weeklies |
| **Vega** | Sensitivity to implied volatility | Short vega → a 5-point IV drop ≈ +$100 here; sell rich IV, buy it back after the crush | An IV *spike* hurts you; pre-earnings IV is pumped, but a post-report gap can swamp the crush |

### Delta in detail — the two-for-one number

Delta does double duty in your head:

1. **Directional exposure:** +0.27 means the position behaves like owning ~27 shares; a $1 rise in NVDA ≈ +$27, all else equal.
2. **Probability proxy:** **‖delta‖ ≈ the rough risk-neutral probability the option finishes in the money.** A 0.27-delta put ≈ ~27% chance of assignment, ~73% chance of keeping everything. This is why a **0.20–0.30 delta** target chooses your assignment odds.

### Theta in detail — the engine

Theta is the daily decay of **extrinsic (time) value.** As the seller you are *long theta.* It is **non-linear**, accelerating as expiration nears (≈ ∝ 1/√(time left) for an at-the-money option). That acceleration is why going closer to expiry pays more per day — but it comes bundled with gamma, the catch.

### Gamma in detail — the bill for theta

Gamma is the rate of change of delta. Being **short gamma** means a fast adverse move makes your delta worsen faster and faster — a comfortable 0.27 put can balloon toward 0.60 in a sharp drop, flipping "73% safe" into very much in play. Gamma is manageable at 35 DTE but explodes in the final week. **This is the core reason the Wheel favors 30–45 DTE over weeklies:** enough theta to get paid without holding the gamma grenade.

### Vega in detail — why *when* you sell matters

Vega is sensitivity to implied volatility. Being **short vega** means you profit when IV falls and lose when it spikes. With illustrative vega 0.20, a 5-point IV drop hands you ~$100 (0.20 × 5 × 100) on top of theta. This is the mechanical reason to **sell when IV / IV Rank is elevated**: sell expensive insurance and buy it back cheap after the "IV crush." It is also why **earnings are landmines** — IV is pumped before the report and collapses after, but the *gap risk* can swamp the crush.

### IV and IV Rank — not Greeks, but inseparable from vega

- **IV (implied volatility)** — the market's implied forward volatility baked into the option's price. Higher IV = fatter premium, but for a *reason.*
- **IV Rank** — where today's IV sits in its own 1-year range, scaled 0–100. IV Rank 70 = premium is rich *for NVDA*; IV Rank 15 = you would be selling cheap insurance for too little — skip it.

## Intrinsic vs. extrinsic value

Every option premium splits into two parts that behave **completely differently** over time:

```
premium = intrinsic + extrinsic

Call intrinsic = max(0, S − K)        Put intrinsic = max(0, K − S)
Extrinsic      = premium − intrinsic
```

- **Intrinsic value** — the in-the-money amount. Pegged to the stock price by arbitrage. **Does not decay.** Moves nearly dollar-for-dollar with the stock.
- **Extrinsic value** — everything else (time value). **Does decay**, reaching exactly $0 at expiration. **Theta is the rate of that decay.**

| | Intrinsic value | Premium is... | Theta decays... |
|---|---|---|---|
| **ITM** | > 0 | intrinsic + extrinsic | only the extrinsic slice |
| **ATM** | 0 | nearly all extrinsic (peak time value) | all of it |
| **OTM** | 0 | 100% extrinsic | all of it |

**The seller's takeaway:** only the **extrinsic** portion is income you harvest via theta. The intrinsic portion of an ITM option is *not* free money — it is the market pricing in that you are already on the hook for assignment. (Full treatment in [Why only extrinsic is harvestable](#why-only-extrinsic-is-harvestable-via-theta) below.)

![Three vertical bars comparing $185 OTM, $192.50 ATM, and $200 ITM puts. The OTM and ATM bars are entirely teal (extrinsic, harvestable). The ITM bar is mostly gray (intrinsic, pegged to the stock) with only a small teal cap of extrinsic on top](/blog/inline/the-wheel-intrinsic-extrinsic.svg)

**Why intrinsic can't be harvested — the arbitrage floor.** *Arbitrage* = a guaranteed, risk-free profit from a price discrepancy. In liquid markets these vanish almost instantly as traders pile in to capture them, which is exactly what enforces the floor below. An NVDA $185 call with the stock at $192.71 has intrinsic value $7.71. If someone offered it for $6.00 (below intrinsic), a trader would buy the call, exercise to buy 100 shares at $185, sell them at $192.71, and pocket $7.71 − $6.00 = $1.71 risk-free per share. That free-money machine is why an ITM option can never trade below intrinsic. The intrinsic floor is locked to the stock and doesn't erode with time — so theta has nothing to chew on there.

## Moneyness — strike vs. spot

**Moneyness** is the relationship between the **strike** and the **current spot price.** It flips between calls and puts — the single most common source of confusion.

### The three zones, and the mirror

| Moneyness | Call (strike K, spot S) | Put (strike K, spot S) | Intuition |
|---|---|---|---|
| **ITM** (in the money) | S **>** K (strike *below* market) | S **<** K (strike *above* market) | Has real exercise value right now |
| **ATM** (at the money) | S ≈ K | S ≈ K | Strike sits at the market |
| **OTM** (out of the money) | S **<** K (strike *above* market) | S **>** K (strike *below* market) | Worthless if exercised today |

**The mirror is the whole trick:** for **calls**, ITM is *below* spot; for **puts**, ITM is *above* spot. A call (right to buy) is valuable when the strike is cheaper than market; a put (right to sell) is valuable when the strike is richer than market.

> **A reflex worth trusting:** "strike above spot on a call → OTM." With NVDA at $192.71, a $205 call is OTM (intrinsic = max(0, 192.71 − 205) = $0). That instant check stops you from being talked into a wrong framing — and a clean OTM option is, by definition, 100% extrinsic.

### Moneyness as the seller's master lever

For a premium seller, moneyness *is* the dial that trades premium against assignment odds, and it lines up almost 1:1 with delta:

| You sell... | Premium | Assignment odds | ‖Delta‖ |
|---|---|---|---|
| Deep OTM | smallest | lowest | ~0.05–0.15 |
| OTM (the income zone) | moderate | low | **~0.20–0.30** |
| ATM | largest *extrinsic* | ~50% | ~0.50 |
| ITM | largest total (but part is intrinsic) | high | ~0.60–0.85 |

The **0.20–0.30 delta target sits squarely in the OTM zone** — the "safe and repeatable" income band by design.

### Cash-secured puts — sell OTM puts (strike *below* $192.71)

| Strike | Zone | Illustrative premium | ‖Delta‖ | Breakeven (K − prem) | Read |
|---|---|---|---|---|---|
| $175 | Deep OTM | $2.00 | 0.15 | $173.00 | Safe, thin income; assigned only on a real drop |
| **$185** | **OTM** | **$4.50** | **0.27** | **$180.50** | Sweet spot — paid well, ~73% expire worthless |
| $192.50 | ~ATM | $7.50 | 0.48 | $185.00 | Max time value, but a coin-flip on assignment |
| $200 | ITM | ~$11.30 ($7.29 intrinsic + ~$4 ext.) | 0.65 | $188.70 | Likely assigned; only ~$4 is true income |

Selling **further OTM** (lower strike) means you get assigned only on a larger drop — capital-preservation friendly, less premium. Selling **closer to the money** means more premium but you agree to buy sooner. The governing question at every strike: *would you be happy owning 100 NVDA at that breakeven?*

### Covered calls — sell OTM calls (strike *above* $192.71), assuming 100 shares at $170 basis

| Strike | Zone | Illustrative premium | Delta | Called-away odds | Read |
|---|---|---|---|---|---|
| $210 | Deep OTM | $2.50 | 0.18 | low | Keep shares most likely; lots of upside room |
| **$205** | **OTM** | **$4.00** | **0.27** | low | Income zone; strike well above basis, real upside preserved |
| $192.50 | ~ATM | $7.50 | 0.50 | ~50% | Fat premium, but capping near today's price |
| $185 | ITM | ~$11 ($7.71 intrinsic + ~$3.30 ext.) | 0.70 | high | Almost certainly called away — but $185 ≥ $170 basis, so it *locks a profit* + premium |

**The key covered-call rule lives in this table:** never sell a call with strike *below* your cost basis. A $165 ITM call would fatten the premium but force a sale at $165 against a $170 basis — paying yourself a few dollars to lock in a $5/share loss. Moneyness can tempt you there; the rule stops you.

### Advantages and disadvantages by zone (for a seller)

| Zone | Advantage | Disadvantage |
|---|---|---|
| **OTM** | Lower assignment odds, pure time-value income, capital-preservation friendly | Smaller premium; a CC caps upside above the strike, a CSP may never deliver the shares you wanted |
| **ATM** | Maximum extrinsic value → maximum theta to harvest | ~50% assignment; effectively transacting at today's price |
| **ITM** | Largest gross premium; high assignment certainty (useful if you *want* the shares or the exit) | Much of the premium is intrinsic, not income; a CC risks capping below basis; a CSP commits you to buy almost immediately |

## Why only extrinsic is harvestable via theta

The core claim: you collect the whole premium up front, but you only get to *keep* the part the buyer can't reclaim through the stock price. Intrinsic is a placeholder for shares you're likely to transact; extrinsic is the actual fee for the service you provide. **Theta is the meter that runs in your favor, and it runs only on the extrinsic balance.**

### Watch theta eat — a 35-day OTM put (the clean case)

NVDA $192.71. Sell the $185 put for $4.50. OTM → intrinsic = $0, **all $4.50 is extrinsic.** Assume NVDA sits perfectly still at $192.71 to isolate pure time decay:

| Days to expiry | Put price (extrinsic) | Intrinsic | Theta (≈$/day) | Your unrealized gain |
|---|---|---|---|---|
| 35 | $4.50 | $0 | 0.10 | $0 |
| 28 | $3.80 | $0 | 0.11 | +$70 |
| 21 | $3.05 | $0 | 0.13 | +$145 |
| 14 | $2.20 | $0 | 0.17 | +$230 |
| 7 | $1.25 | $0 | 0.22 | +$325 |
| 2 | $0.45 | $0 | 0.30 | +$405 |
| 0 | $0.00 | $0 | — | **+$450** |

Every dollar was extrinsic, so theta harvested **100% of it.** And the melt **accelerates** — theta grows toward expiry (the non-linearity from the Greeks section). Harvest = the entire premium.

![Line chart of the put price falling from $4.50 at 35 days to expiration down to $0 at expiration. The curve is gentle in the middle and gets visibly steeper in the final week, with annotations marking the slow early decay and the much faster decay in the last few days](/blog/inline/the-wheel-theta-decay.svg)

### The contrast — an ITM put where most premium is NOT harvestable

NVDA still $192.71. This time sell the **$200 put** (ITM by $7.29) for **$11.00**:

```
Intrinsic = max(0, K − S) = max(0, 200 − 192.71) = $7.29   ← does NOT decay
Extrinsic = 11.00 − 7.29                          = $3.71   ← the only harvestable part
```

If NVDA sits still at $192.71 to expiration:

| Component | At entry | At expiration (stock unchanged) | What happened |
|---|---|---|---|
| Intrinsic | $7.29 | $7.29 | Untouched — still $7.29 ITM |
| Extrinsic | $3.71 | $0 | **Theta ate this** |
| Option price | $11.00 | $7.29 | — |

You collected $11.00, but at expiry the put is worth $7.29 and you are assigned: buy 100 shares at $200 while they are worth $192.71. P/L = +$1,100 premium − $729 assignment loss = **+$371** — *exactly the extrinsic value you sold.* The $7.29 of intrinsic was never income; it was cash now in exchange for the near-certainty of overpaying for shares later.

### The unifying picture

| You sell | Premium | Intrinsic (not yours) | Extrinsic (harvestable) | Max theta income |
|---|---|---|---|---|
| $185 put (OTM) | $4.50 | $0 | **$4.50** | $4.50 |
| ~$192.50 put (ATM) | ~$7.50 | ~$0 | **~$7.50** | ~$7.50 |
| $200 put (ITM) | $11.00 | $7.29 | **$3.71** | $3.71 |

**Three counterintuitive payoffs to internalize:**

1. **The biggest premium is rarely the biggest income.** The ITM $200 put pays $11.00 but only $3.71 is real income; the OTM $185 put pays $4.50 and *all of it* is. Premium size is a vanity metric — **extrinsic value is the real one.**
2. **ATM options have the most extrinsic value of all.** Intrinsic is zero at the money and time value peaks there, so the most *harvestable* premium per contract sits at ATM — which is also where assignment is a coin-flip. That is the premium-vs-risk tradeoff that moneyness controls.
3. **"Sell expensive, buy it back cheap" is just harvesting extrinsic.** The 50%-profit rule and the IV-crush edge are the same idea: sell when extrinsic is fat (high IV, more days left), then close once theta has eaten most of it — before the gamma risk of the final days. You're not predicting direction; you're farming the extrinsic balance and handing the position back before it can turn on you.

### Worked verification, call side

NVDA $192.71. Sell the **$185 call** (strike below spot → ITM) for **$11.00**, 35 DTE.

- **Split:** Intrinsic = max(0, S − K) = 192.71 − 185 = **$7.71;** Extrinsic = 11.00 − 7.71 = **$3.29.**
- **If NVDA pins at $192.71 to expiry:** the call is ITM by $7.71, worth exactly $7.71 (all time value gone). You're called away: sell 100 shares at $185 while they are worth $192.71 → −$771 assignment, +$1,100 premium = **+$329** — precisely the extrinsic value sold.
- **In plain words:** theta harvested the **$3.29** of time value; the **$7.71** of intrinsic never decayed — it sat as a placeholder for shares you were always likely to deliver, and at expiration converted into exactly that obligation (sell at $185, $7.71 below market).

**The reflex this builds:** read any option you sell and immediately know your true earnings ceiling. Premium is the headline; **extrinsic is the paycheck.** Mentally strip out intrinsic before being impressed by a fat premium — that habit separates chasing big-number ITM premiums from actually harvesting income.

## Execution — sell expensive, buy it back cheap

The phrase compresses a full round-trip into four words. It is **two separate orders at two different times:** open the position, then later close it.

### The mechanic, decompressed

- **"Sell expensive"** = **Sell-to-Open (STO)** when the option is fat with extrinsic value (high IV, ~30–45 DTE). You collect premium.
- **"Buy it back cheap"** = **Buy-to-Close (BTC)** later, once theta has melted most of that extrinsic away. You pay a smaller amount to cancel the obligation.

Profit = the difference. You never have to let it expire or get assigned — you rent out extrinsic value and buy back the deflated contract. The **50% rule** is simply the trigger for *when* to buy it back.

### Worked round-trip on NVDA

NVDA $192.71. The $185 put, 35 DTE, extrinsic-rich:

| Step | Action | Price | Cash flow |
|---|---|---|---|
| 1. Open | **STO** 1× $185 put | $4.50 | **+$450** |
| 2. Wait | Theta + any IV drop deflate it | drifts to ~$2.25 | — |
| 3. Close | **BTC** the same put | $2.25 | **−$225** |
| **Net** | | | **+$225 realized** |

You captured **$2.25 of the $4.50** — the "50% of max profit" target. Free capital to open a fresh cycle, and you've **dodged the final-week gamma risk** entirely. You gave up the last $2.25 of potential profit in exchange for being flat and safe. That trade-off is the heart of the 50% rule.

### Executing leg 1 — Sell-to-Open

1. Trade tab → enter NVDA → open the ~35 DTE expiration.
2. On the **put** side, find the $185 row. Right-click its **Bid** → Sell → Single.
3. Order Entry populates a `SELL −1 … PUT LIMIT` line. Set the limit to the **Mark** (~4.50); adjust a penny or two for a faster fill.
4. Confirm **Buying Power Effect ≈ $18,500** — this line in the order confirmation shows the cash your broker will lock up to back the trade. For a true cash-secured put it must equal strike × 100; anything smaller means the order would be using margin instead of full cash collateral.
5. Confirm and Send. You're now short the put, +$450 in the account.

### Executing leg 2 — the Buy-to-Close, staged immediately

The discipline lives here: **don't wait and watch — stage the closing order the moment the open fills**, as a GTC (Good-Til-Canceled) order at your 50% target. Buy back at half of $4.50 = **$2.25.**

1. In the Monitor tab (or Position Statement), find your −1 NVDA $185 put.
2. Right-click the position → Create Closing Order → Buy to Close.
3. Order Entry shows a `BUY +1 … PUT LIMIT`. Set the limit price to **2.25.**
4. Change order duration from DAY to **GTC** (dropdown in the order row).
5. Confirm and Send.

The order now lives on the broker's server. The instant the put touches $2.25 — whether in 12 days or 25 — it fills automatically, banks $225, and frees the $18,500. No screen-watching, no greed holding for the last few dollars.

### The two orders as a pair

| Leg | Order type | When | Duration | Why |
|---|---|---|---|---|
| Open | Sell-to-Open, LIMIT @ ~4.50 | now, IV rich | DAY | Collect extrinsic |
| Close | Buy-to-Close, LIMIT @ 2.25 | staged right after open | **GTC** | Auto-harvest 50%, exit before gamma week |

### Two refinements worth knowing

- **Faster shortcut for the pair:** after the open order fills, right-click the filled order → "Create Opposite Order" pre-builds the Buy-to-Close with correct quantity and side — just set the price to 2.25 and flip to GTC.
- **Why "expensive" matters at entry:** the round trip only works if you sold real extrinsic value to begin with. Selling when IV Rank is near zero means thin premium with little to decay. The "sell expensive" half means waiting for elevated IV so there's a fat extrinsic balance for theta (and a post-event IV crush) to work on. Buy-it-back-cheap is only profitable in proportion to how expensive the sale was.

**The four words, fully expanded:** STO into rich extrinsic → stage a GTC BTC at 50% → let theta and IV crush do the work → bank it and redeploy. One full turn of premium harvesting, repeated.

## Best practices, caveats, and the honest downside

**Targets and parameters used throughout:**

- **Delta target: 0.20–0.30** (≈ 70–80% chance of expiring OTM) for both CSPs and CCs.
- **DTE to open: 30–45 days** — the theta sweet spot that avoids the worst of gamma. Avoid weeklies until the monthly rhythm is second nature.
- **CC strike ≥ cost basis** — never cap upside below what you paid.
- **Close at 50% of max profit** — stage a GTC buy-to-close immediately after opening so it's automatic.
- **Sell when IV / IV Rank is elevated** — richer premium and a post-event crush in your favor.

**Best practices:**

- Always use **limit orders** at or near the Mark; never market-order an option.
- Confirm **Buying Power Effect** matches strike × 100 (for a CSP) — proof it's cash-secured. **No naked options, ever.**
- Check **liquidity** (tight bid-ask spread, healthy open interest) before trading any name.
- **Strip intrinsic out** of any premium before judging it — extrinsic is the actual income.
- Trust the **moneyness reflex** (call ITM = strike below spot; put ITM = strike above spot) to catch bad framings instantly.

**Caveats and honest risk:**

- Premium selling is **not free money.** A CSP's downside runs nearly to zero (the −$18,050 tail on the $185 example); a CC caps upside while leaving stock risk essentially intact.
- **Annualized yield is a yardstick, not a promise** — it assumes flawless repetition with no losses.
- **Earnings are landmines:** pre-earnings IV is pumped, but post-report gap risk can swamp the IV crush. Default to not holding short options through earnings.
- **Gamma explodes in the final week**, especially on weeklies — the reason to favor 30–45 DTE.
- **American-style assignment can happen early**, particularly on ITM options near ex-dividend dates.
- **Delta as probability is risk-neutral and a snapshot** — real-world odds differ slightly, and the number moves with the stock.

## Formula reference

```
Contract size:            1 contract = 100 shares

Call intrinsic:           max(0, S − K)
Put intrinsic:            max(0, K − S)
Extrinsic value:          premium − intrinsic

CSP cash secured:         strike × 100   (per contract)
CSP breakeven:            strike − premium per share
CSP max profit:           premium received
CSP assigned cost basis:  strike − premium per share
CSP P/L if assigned:      (S − strike) × 100 + premium    (per contract, at expiry)

CC effective basis:       cost basis − premium per share
CC P/L if called away:    (strike − cost basis) × 100 + premium
CC max profit:            (strike − cost basis) × 100 + premium

Return on capital:        premium / capital secured
Annualized (yardstick):   ROC × (365 / DTE)

Delta (probability proxy):  ‖delta‖ ≈ risk-neutral prob. of finishing ITM
Theta near expiry (ATM):    ≈ ∝ 1 / √(time remaining)
Vega P/L:                   ≈ vega × (IV change in points) × 100   (per contract)

Position greek signs (short option):  flip the option's own sign
  short put:  +delta, +theta, −vega, −gamma
```

Where **S** = spot price, **K** = strike. Per-contract dollar figures multiply per-share values by 100.

## Glossary

| Term | Definition |
|---|---|
| **Option** | A contract over 100 shares; the buyer gets a right, the seller takes an obligation for a premium. |
| **Call** | The right to *buy* 100 shares at the strike. |
| **Put** | The right to *sell* 100 shares at the strike. |
| **Strike (K)** | The agreed transaction price. |
| **Expiration** | The date the option's right ends. |
| **DTE** | Days to expiration. |
| **Premium** | The price of the option; cash the seller collects up front. |
| **Sell-to-Open (STO)** | Opening a short option position to collect premium. |
| **Buy-to-Close (BTC)** | Buying back a short option to close it. |
| **Assignment** | Being obligated to fulfill the contract (sell shares on a short call; buy shares on a short put). |
| **Exercise** | The buyer invoking their right. |
| **American-style** | Exercisable on any day before expiration (US equity options); allows early assignment. |
| **Cash-Secured Put (CSP)** | A short put fully backed by cash = strike × 100; no naked risk. |
| **Covered Call (CC)** | A short call backed by 100 owned shares. |
| **The Wheel** | CSP → assignment → CC → called away → repeat; premium collected at each step. |
| **ITM / ATM / OTM** | In / at / out of the money — the strike-vs-spot relationship (mirrored between calls and puts). |
| **Intrinsic value** | The in-the-money amount; arbitrage-pegged; does not decay. |
| **Extrinsic (time) value** | Premium minus intrinsic; decays to zero at expiration; the harvestable income. |
| **Moneyness** | The relationship between strike and current spot price. |
| **Delta** | Directional exposure per $1 move; ‖delta‖ ≈ probability of finishing ITM. |
| **Theta** | Daily decay of extrinsic value; positive (favorable) for a seller. |
| **Vega** | Sensitivity to implied volatility; negative for a seller (profit when IV falls). |
| **Gamma** | Rate of change of delta; negative for a seller; explodes near expiry. |
| **IV (Implied Volatility)** | The market's implied forward volatility priced into an option. |
| **IV Rank** | Where current IV sits in its 1-year range (0–100); high = rich premium. |
| **IV crush** | A sharp drop in IV (often post-earnings) that benefits short-vega sellers. |
| **Bid / Ask / Mark** | Sell price / buy price / midpoint; the Mark is the realistic fill target. |
| **Bid–ask spread** | Ask minus bid; a liquidity indicator. |
| **Open Interest** | Number of outstanding contracts; a liquidity indicator. |
| **Prob OTM** | Model-estimated probability the option expires out of the money. |
| **Buying Power Effect** | Capital tied up by an order; for a CSP it should equal strike × 100. |
| **GTC** | Good-Til-Canceled order duration; stays working until filled or canceled. |
| **Roll** | Closing one short option and opening another (different strike or expiry), ideally for a net credit. |
| **Cost basis** | Effective per-share price paid for owned shares. |
| **Breakeven** | The spot price at which the trade nets zero P/L. |
| **50% rule** | Closing a short option once it has lost half its value, to capture most of the premium with least remaining risk. |

## Takeaways

- **You are always the seller.** Every position in the Wheel collects premium up front and takes on an obligation in return.
- **Premium ≠ income.** Strip out the intrinsic portion of any option you consider selling. Only the **extrinsic** part is harvestable via theta.
- **Choose your assignment odds.** Targeting 0.20–0.30 delta puts you in the OTM "income zone" — paid well, ~70–80% chance of expiring worthless.
- **Live in the 30–45 DTE band.** Enough theta to earn, far enough from the gamma grenade of the final week.
- **Close at 50%, staged GTC the moment you open.** It removes screen-watching and harvests the gentle middle of the decay curve.
- **CC strike ≥ cost basis, always.** A covered call should never lock in a loss for the privilege of collecting a few dollars of premium.
- **Sell when IV is rich.** Vega is short for you — a post-event IV crush is real money on top of theta. Skip thin-premium IV environments.
- **The −$18,050 tail is the honest risk.** A CSP's downside runs nearly to zero. Annualized yield is a yardstick, not a promise.
- **The Wheel only breaks when you sell a CSP on a stock you weren't willing to own.** That is the single rule that prevents the cycle from going wrong.

Premium selling is mechanical, but it is not passive. The mechanics shown here — moneyness, the Greeks, the intrinsic-vs-extrinsic split, the execution discipline — are the foundation. What you do *with* that foundation is your decision, and your responsibility.

If you got here from the calculator, the same patient-saver mindset applies to both. If you got here cold, [try the Monte Carlo retirement calculator →](/tools/monte-carlo-retirement-calculator) to see what the long-arc compounding side of the same question looks like.
