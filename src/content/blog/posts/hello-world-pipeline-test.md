---
title: "Hello, world — a pipeline test post"
date: "2026-06-28"
category: "Meta"
tags: [pipeline-test, scaffolding, delete-me]
excerpt: "A throwaway post used during initial setup to verify the blog pipeline end-to-end. Delete this once a real article ships."
featuredImage: "/og-default.png"
featuredImageAlt: "The Ant Fund default share card — used here as a placeholder hero image"
---

This is the very first post on The Ant Fund. It exists to prove that the blogging pipeline works from end to end: Markdown in, static HTML out, with the right metadata, the right links, and the right look. If you can read this, the plumbing works.

Once a real article ships, this post should be deleted. It is intentionally labeled with the `delete-me` tag.

## What this post is for

This post exercises every piece of the rendering pipeline so a single page-load tells me whether the system is healthy. The checks below are not advice or analysis — they are a tour of features.

If any of the sections below render incorrectly, the bug is in the *infrastructure*, not the content.

### Why a "pipeline post"

A static site generator can fail in subtle ways: the build succeeds, but a particular Markdown construct renders wrong, an image path 404s under the deployed base URL, or a heading anchor doesn't line up with the table of contents. Catching that in a real article is bad — readers see it. Catching it here is fine — only I do.

## A short list, because lists are common

- Patient.
- Steady.
- Skeptical of anything that promises *certainty* about future returns.

And an ordered list for completeness:

1. Define what you actually need the portfolio to do.
2. Pick assumptions you can defend.
3. Pressure-test the plan against bad luck, not just the average case.

## A table, because comparison posts will use them

| Approach | What it measures | When it lies to you |
| --- | --- | --- |
| Average return | A single point estimate | When dispersion is what matters |
| Worst case | The scariest historical path | When the future is worse than the past |
| Monte Carlo | A distribution of outcomes | When the inputs are wrong |

The table is the kind of structure a comparison-style post leans on. Worth verifying it renders cleanly.

## A blockquote, for one sharp idea

> A plan that only works in the average case is not a plan. It is a hope.

## Inline formatting

Inline code looks like `withdrawal-rate` or `npm run build`. **Bold text** earns a glance, *italic text* whispers a name (a book, a paper, a fund). Both should sit comfortably inside Inter without fighting the line height.

## A code block

For finance posts, code is rare. But when it shows up — usually for a small Python or JavaScript demonstration — the styling should be readable, not eye-watering:

```python
def safe_withdrawal(starting_value, rate=0.04, years=30):
    """Naive 4% rule: pull a constant real amount each year."""
    annual = starting_value * rate
    return [annual for _ in range(years)]
```

The renderer doesn't syntax-highlight (a deliberate choice — see the wrap-up notes). The block above should still be clearly demarcated and monospaced.

## An image

![A placeholder featured-image card, used here to verify the inline image renderer](/og-default.png)

If the image above renders and has its alt text wired up for screen readers, the inline image pipeline is healthy.

## Links

Internal links should navigate without a full page reload — try clicking [the tools hub](/tools) or [the blog listing](/blog). External links should open in a new tab and carry `rel="noopener noreferrer"`, like the [Bogleheads wiki](https://www.bogleheads.org/). Anchor links should jump to the right section, like jumping back to [what this post is for](#what-this-post-is-for).

## What I'm intentionally **not** testing here

- Syntax highlighting of code blocks (the dep is not installed; a finance blog rarely needs it).
- MDX or React components in Markdown (Markdown is enough for what we publish).
- Comments (not building them; static site).

## What to do with this post

Once a real article is live, delete this file from `src/content/blog/posts/` and rebuild. The sitemap, RSS feed, "Latest Articles" home-page strip, and blog listing will all update automatically. No other edits required.

[Try the Monte Carlo retirement calculator →](/tools/monte-carlo-retirement-calculator)
