---
course: options-trading
order: 1
title: "Options trading basics"
date: "2026-09-19"
excerpt: "A pre-class guide to what calls and puts are, how profit and loss works at expiration, and how to plan a trade before you place it."
description: "Beginner's guide to options trading: calls and puts, strike, expiration and premium, ITM/ATM/OTM, breakeven and profit/loss for long calls and puts, reading an option chain, common mistakes, and a trade-planning worksheet."
agenda:
  - Calls and puts
  - Strike price, expiration and premium
  - ITM, ATM and OTM
  - Breakeven and profit/loss
  - Trade selection and risk management
relatedPosts: [calls-and-puts-explained, the-wheel-options-foundations]
---

## What this guide is for

This guide is designed to be read before the live session. The goal is not to turn you into an options trader overnight. It is to give you a simple mental model for understanding what an option is, why people use options, when a call or put may make sense, and how the profit and loss works — before you place a trade.

**Format:** beginner-friendly, examples first, minimal Greeks.

> **Important:** Options involve substantial risk and are not suitable for every investor. This material is for education only and is not individualized investment, tax or legal advice. Examples are simplified and exclude commissions, fees, taxes, the bid/ask spread and early-exercise effects unless stated.

## 1. What you will learn

By the end of the session, you should be able to:

- Explain in plain English what a call option and a put option are.
- Explain the four basic pieces of an option contract: underlying, strike, expiration and premium.
- Read a basic option chain without getting overwhelmed by the Greeks.
- Understand the difference between ITM, ATM and OTM options.
- Calculate the breakeven at expiration for a long call and a long put.
- Describe the maximum loss and the upside/downside potential of a long option.
- Choose between a call, a put, or simply owning the underlying, based on a clearly defined market view.
- Understand why time matters, and why an option can lose value even when the underlying moves in the expected direction.
- Recognize common beginner mistakes before entering a trade.
- Build a simple trade plan: thesis → contract → risk → exit.

## 2. The big picture: why do people use options?

An option is a contract that gives the buyer a **right, but not an obligation**, to buy or sell an underlying asset at a specified price, either before or at expiration depending on the option style. (American-style options, which include most U.S. stock options, can be exercised at any time up to expiration; European-style options only at expiration.) The buyer pays a price for this right, called the **premium**.

People traditionally use options for several different purposes:

- **Directional exposure:** express a bullish or bearish view with a defined maximum loss when buying an option.
- **Leverage and capital efficiency:** control exposure to a larger notional value with less upfront capital than buying the underlying outright. This also magnifies risk.
- **Hedging:** protect an existing stock or portfolio position against an adverse move.
- **Income strategies:** collect premium by selling options — with a risk profile that can be very different from buying options.
- **Flexibility:** construct positions around price, time and volatility expectations.

> **A key mindset:** options are not automatically better than stocks. They are a different tool. The right question is usually: *What exposure am I trying to create, and what risk am I willing to accept?*

## 3. The four things you must know before buying an option

### 1. Underlying

The stock, ETF, index or other asset the option is based on. Example: XYZ stock is trading at $100.

### 2. Strike price

The price at which the option gives the buyer the right to buy or sell the underlying, subject to the contract terms.

### 3. Expiration date

The date on which the option contract expires. The time remaining matters: as expiration approaches, the option has less time left to become valuable.

### 4. Premium

The price paid by the option buyer. For standard U.S. equity options, one contract generally represents 100 shares, so a quoted premium of $2.00 normally means $200 per contract before fees.

> **Example:** XYZ $105 call, 45 days to expiration, premium $2.00. The buyer pays approximately $200 for one contract.

> Once you've chosen the underlying, think of the option as a package that answers three questions: **Where?** (strike), **When?** (expiration) and **How much?** (premium).

## 4. Calls vs. puts — the simplest explanation

| Option | The buyer receives the right to… | Usually considered when you expect… |
|---|---|---|
| **Call** | Buy the underlying at the strike price. | The underlying to rise. |
| **Put** | Sell the underlying at the strike price. | The underlying to fall. |

> **Important distinction:** buying a call is not the same as buying stock, and buying a put is not simply "shorting" the stock. An option has an expiration date and a premium, so both the **timing** and the **size** of the move matter.

## 5. How buying a call works

A long call is commonly used when you have a bullish view and want a defined maximum loss: the premium you paid.

### Example

| Trade detail | Value |
|---|---|
| XYZ stock price | $100 |
| Position | Buy 1 XYZ $105 call |
| Expiration | 45 days |
| Premium | $2.00 per share |
| Contract multiplier | 100 |
| **Cost** | **$2.00 × 100 = $200** |

### What happens at expiration?

| XYZ at expiration | Call's intrinsic value | Result (before fees) |
|---|---|---|
| $100 | $0 — the option expires worthless | Loss of $200 |
| $105 | $0 — at the strike, but the premium hasn't been recovered | Loss of $200 |
| $107 | $2.00 per share (about $200) | About $0 — breakeven |
| $115 | $10.00 per share (about $1,000) | Profit of about $800 |

> **Breakeven at expiration for a long call:** strike + premium = $105 + $2 = **$107**.

- **Maximum loss:** the premium paid — $200 in this example.
- **Upside:** theoretically unlimited, because there is no ceiling on how high the underlying can rise.

> **The most important lesson:** being right about the direction is not enough. You also need enough price movement, soon enough, to overcome the premium you paid.

## 6. How buying a put works

A long put is commonly used when you have a bearish view and want a defined maximum loss: the premium you paid.

### Example

| Trade detail | Value |
|---|---|
| XYZ stock price | $100 |
| Position | Buy 1 XYZ $95 put |
| Expiration | 45 days |
| Premium | $2.00 per share |
| Contract multiplier | 100 |
| **Cost** | **$2.00 × 100 = $200** |

### What happens at expiration?

| XYZ at expiration | Put's intrinsic value | Result (before fees) |
|---|---|---|
| $100 | $0 — the option expires worthless | Loss of $200 |
| $95 | $0 — at the strike, but the premium hasn't been recovered | Loss of $200 |
| $93 | $2.00 per share (about $200) | About $0 — breakeven |
| $80 | $15.00 per share (about $1,500) | Profit of about $1,300 |

> **Breakeven at expiration for a long put:** strike − premium = $95 − $2 = **$93**.

- **Maximum loss:** the premium paid — $200.
- **Maximum intrinsic value:** approaches the strike price as the underlying falls toward zero. In this example, if XYZ fell all the way to $0, the put would be worth $95 per share ($9,500), a profit of about $9,300. Actual economics depend on the contract and the underlying.

> The put buyer needs a large enough downward move to overcome the premium. A small decline may still produce a loss at expiration.

## 7. ITM, ATM and OTM — don't let the acronyms scare you

These terms describe the relationship between the underlying's current price and the option's strike.

| Term | Simple meaning for a call | Simple meaning for a put |
|---|---|---|
| **ITM** (in the money) | Stock price is above the strike. | Stock price is below the strike. |
| **ATM** (at the money) | Stock price is near the strike. | Stock price is near the strike. |
| **OTM** (out of the money) | Stock price is below the strike. | Stock price is above the strike. |

### Why choose a different strike?

- **Closer to the current price:** generally costs more, because it has more immediate intrinsic or near-intrinsic exposure.
- **Farther OTM:** generally costs less, but needs a larger favorable move to become profitable at expiration.
- **Deep ITM:** behaves more like the underlying itself, but requires more premium and capital.

> There is no universally "best" strike. Strike selection should match your expected move, your time horizon, and the premium loss you are prepared to accept.

## 8. Expiration: the clock is part of the trade

With a long option, you are not only making a decision about price direction. You are also choosing how much time you give your thesis to work. An option that expires tomorrow has a very different risk profile from one that expires six months from now.

- **Shorter expiration** can be cheaper, but leaves less time for the expected move.
- **Longer expiration** generally costs more, but gives the trade more time.
- **As expiration approaches,** time value tends to erode more rapidly, all else equal.

> **A beginner question to ask:** "If my thesis is correct, how long do I reasonably expect the move to take?" Then choose an expiration that gives the thesis enough time — rather than automatically choosing the cheapest option.

## 9. When would someone traditionally buy a call or put?

> Start with the market thesis — not the option chain.

### Step 1 — Form a directional view

- **Bullish:** you expect the underlying to rise.
- **Bearish:** you expect the underlying to fall.
- **Neutral or uncertain:** a long call or long put may not match your thesis; simply waiting may be a valid decision.

### Step 2 — Estimate the move and the time

Ask: "How far do I expect it to move, and by when?" That is far more useful than simply saying "I think it will go up."

### Step 3 — Decide whether an option is actually appropriate

- If you want ownership and are comfortable with stock risk, **buying shares** may be simpler.
- If you want a defined maximum loss and directional leverage, **a long option** may fit the objective.
- If your main objective is protection, **a put** can act as insurance for an existing long position.
- If you want income, understand that **selling options** creates a different risk profile — it should not be treated as the same strategy as buying options.

### Step 4 — Select the strike and expiration

Only after the thesis is defined should you compare contracts. Consider the premium, the breakeven, the probability of the underlying reaching your target, liquidity and the bid/ask spread, and the maximum loss you can accept.

### Step 5 — Define the exit before entering

- What price move proves the thesis right?
- What price or time behavior proves the thesis wrong?
- What is the maximum dollar amount you are willing to lose?
- Will you take profits before expiration, or hold to expiration?

## 10. Stock vs. long call: same direction, different trade

Suppose XYZ is at $100 and you are bullish.

| Choice | Illustration | Main consideration |
|---|---|---|
| **Buy 100 shares** | $10,000 stock position | No expiration — the stock can be held indefinitely. The loss can be large if the stock falls substantially. |
| **Buy 1 call** | $105 strike call at $2 = $200 premium | Defined premium loss, but expiration and breakeven matter. |

> If XYZ rises slowly from $100 to $103, the stock position is up $300, while the $105 call could still be worth less than the $200 originally paid, depending on the time remaining and other market factors. If XYZ is still at $103 at expiration, the call expires worthless — a loss of the full $200. This is why "I was right about the direction" does not automatically mean "I made money on the option."

> **Options add another dimension: timing.**

## 11. A simple profit/loss framework

```
Long call at expiration:  Profit/Loss ≈ [max(Stock price − Strike, 0) − Premium] × 100
Long put at expiration:   Profit/Loss ≈ [max(Strike − Stock price, 0) − Premium] × 100
```

Checking these against the earlier examples: the $105 call with XYZ at $115 gives [max(115 − 105, 0) − 2] × 100 = **$800**, and the $95 put with XYZ at $80 gives [max(95 − 80, 0) − 2] × 100 = **$1,300** — the same results as in sections 5 and 6.

These formulas describe the value at expiration. Before expiration, an option's market price can differ from its intrinsic value — it usually carries additional time value — because time remaining, implied volatility, supply and demand, and other factors all affect the market premium.

## 12. Greeks — only what a beginner really needs

You don't need to memorize a Greek textbook to understand your first long call or put. But two concepts are useful from day one.

### Delta — "How much does the option tend to respond to a $1 move?"

Delta is commonly used as a rough measure of how much an option's price may change for a small move in the underlying, all else equal. For example, a call with a delta of 0.50 tends to gain about $0.50 per share — about $50 per contract — when the stock rises $1. Puts have negative deltas, because they gain value when the stock falls. For a beginner, the important idea is that different strikes have different sensitivity to the underlying.

### Theta — "What happens as time passes?"

Theta represents the effect of the passage of time on an option's value, all else equal. For long option buyers, time decay is generally a headwind. This is why a long option buyer needs to think about **direction + magnitude + timing**.

> **Later topics:** implied volatility, Vega, Gamma, Rho and the volatility surface can be added once the basic mechanics feel comfortable.

## 13. Common beginner mistakes

- Buying the cheapest OTM option because it "looks like a bargain."
- Ignoring expiration and assuming the option will eventually work if the direction is correct.
- Using too much of the account on one high-conviction trade.
- Entering without knowing the maximum dollar loss.
- Confusing the option's premium with the underlying's price.
- Ignoring the bid/ask spread and liquidity.
- Holding until expiration without understanding exercise and expiration procedures.
- Buying options immediately before a major event without understanding that volatility can change quickly.
- Trading based on someone else's target without having your own thesis and exit plan.

## 14. How to read a basic option chain

When you open an option chain, focus on these columns first:

| Item | What to ask |
|---|---|
| **Expiration** | How much time does my thesis need? |
| **Strike** | How far from the current price is this strike? |
| **Bid / Ask** | How much could I realistically pay or receive? How wide is the spread? |
| **Last** | What was the last traded price? Don't assume it is the current executable price. |
| **Volume / Open interest** | Is there reasonable trading activity and liquidity? |
| **Delta / Greeks** | Useful secondary information — don't let them replace the trade thesis. |

## 15. Buying the option: a generic order process

1. Choose the underlying.
2. Choose the expiration.
3. Choose call or put.
4. Choose the strike.
5. Review the premium and calculate the approximate total cost.
6. Check the bid/ask spread and liquidity.
7. Choose the order type. A **limit order** lets you specify the maximum price you are willing to pay.
8. Review the order ticket carefully: quantity, strike, expiration, call/put, buy/sell.
9. Before submitting, state your maximum acceptable loss and your exit plan.

> **Exercise vs. selling the option:** a trader who owns an option does not necessarily need to exercise it. Many traders close a profitable or losing option by selling the option itself before expiration. Exercising can create a stock position, with tax and settlement consequences depending on the contract.

## 16. Beginner trade planning worksheet

Use this worksheet before discussing or placing any example trade during the live class.

| # | Item | Your plan |
|---|---|---|
| 1 | Underlying / ticker | |
| 2 | Current price | |
| 3 | My directional view | ☐ Bullish ☐ Bearish ☐ Neutral / wait |
| 4 | Why? | |
| 5 | Expected move | From ______ to ______ |
| 6 | Expected timing | |
| 7 | Instrument | ☐ Stock ☐ Call ☐ Put ☐ Other |
| 8 | Expiration | |
| 9 | Strike | |
| 10 | Premium / estimated cost | |
| 11 | Breakeven at expiration | |
| 12 | Maximum planned loss | $ |
| 13 | Profit-taking plan | |
| 14 | What would make me exit? | |

## 17. Questions to think about before the live class

- Why might someone buy a call instead of buying the stock?
- Why might someone buy a put instead of simply selling a stock they own?
- Why can an option buyer lose money even when the underlying moves in the expected direction?
- Why is the cheapest option not necessarily the most attractive option?
- What is the difference between being right about direction and being right about direction *and* timing?
- What does "defined maximum loss" mean for a long call or long put?
- What information would you want before selecting a strike and expiration?

## 18. Quick reference glossary

| Term | Meaning |
|---|---|
| **Call** | An option giving the buyer the right to buy the underlying at the strike, subject to the contract terms. |
| **Put** | An option giving the buyer the right to sell the underlying at the strike, subject to the contract terms. |
| **Strike** | The contract price at which the right to buy or sell is defined. |
| **Expiration** | The date on which the option contract expires. |
| **Premium** | The market price paid by the option buyer and received by the option seller. |
| **ITM** | In the money — the option has intrinsic value. |
| **ATM** | At the money — the strike is near the underlying's price. |
| **OTM** | Out of the money — the option has no intrinsic value. |
| **Breakeven** | The underlying's price at expiration at which a long option approximately recovers its premium, before fees. |
| **Intrinsic value** | The amount an option would be worth if it expired immediately. |
| **Time value** | The portion of an option's premium above its intrinsic value. |
| **Volatility** | A measure of the magnitude of price movement. Implied volatility is embedded in option prices. |
| **Liquidity** | How easily a contract can be traded at a reasonable cost, without a large price concession. |
| **Assignment** | The process by which an option seller is assigned an exercise obligation. Option buyers exercise; they are not assigned. |

## 19. Final takeaway

> For a beginner, options trading starts with a simple sequence: **What do I think the underlying will do? How far? By when? How much am I willing to lose?** Only then should you choose the option contract.

A call is commonly associated with a bullish view, and a put with a bearish one. But an option contract adds strike, expiration, premium and timing to the decision. Learning these mechanics first builds the foundation for later topics such as covered calls, protective puts, spreads, credit strategies, volatility and the Greeks.

### Educational disclaimer

This guide is educational material intended to support a general learning session. It does not constitute investment, financial, tax or legal advice, and it does not recommend any specific security, option contract, strategy, strike, expiration or transaction. Options involve risk and can result in substantial losses. Before trading, investors should review the characteristics and risks of standardized options and consider whether options are appropriate for their circumstances. Examples in this guide are simplified and may not reflect actual market prices or execution.

> **Bring this guide to the session.** We will use the examples and the worksheet to walk through an option chain and build sample trades step by step.
