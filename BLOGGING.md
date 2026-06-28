# BLOGGING.md — The Ant Fund

Style guide and authoring workflow for the blog. Read this once before writing your first post; refer back to the SEO and accessibility checklists every time you publish.

---

## 1. Workflow at a glance

1. `npm run new-post -- "My Post Title"` — scaffolds a new Markdown file from the standard template, with date and slug pre-filled.
   - For a comparison-style post: `npm run new-post -- "X vs Y" --template=comparison`.
2. Edit the file at `src/content/blog/posts/<slug>.md`. Replace every `REPLACE` marker.
3. `npm run dev` — visit `http://localhost:5173/blog` to see the listing and `/blog/<slug>` to preview your post.
4. `npm run typecheck && npm run lint && npm run build && npm run preview` — final check before pushing.
5. `git push origin main` — the GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically.

The blog is fully static. There is no CMS, no API, no database. Adding a post = adding a Markdown file.

---

## 2. Voice and tone

The Ant Fund is the patient saver: slow, steady, jargon-free, approachable but trustworthy. We write like a thoughtful friend who happens to know the math, not like a financial advisor or a finance influencer.

**Do:**
- Use the second person ("you") when you're addressing the reader directly.
- Use concrete numbers and examples.
- Surface assumptions and trade-offs explicitly.
- Frame financial ideas as decisions, not as rules.

**Don't:**
- Use exclamation marks. Ever.
- Promise outcomes. The market doesn't.
- Use jargon without explaining it the first time. "Sequence-of-returns risk" gets a one-sentence definition; "P/E ratio" gets a one-sentence definition.
- Use "we" for the publisher unless it actually means a group.

**Never:** give financial advice. We publish educational content. Every post should be readable as "here's how to think about this," not "here's what you should do."

---

## 3. Formatting rules

### Heading hierarchy
- `#` is reserved for the page title (set automatically from frontmatter); never write `#` in the body.
- `##` for top-level sections. These also populate the table of contents.
- `###` for sub-sections. These show in the TOC, indented.
- `####` and below: only inside long technical posts. They don't appear in the TOC.

Keep section headings short — five words or fewer where possible. Headings are scan targets, not summaries.

### Paragraphs
- One idea per paragraph.
- Three to five sentences is the target. A one-sentence paragraph is fine for emphasis. Eight sentences is too long — break it.

### Lists
- Use bulleted lists for parallel items (options, criteria, examples).
- Use numbered lists only when order matters (steps, ranks).
- If list items need their own paragraph of explanation, use bold lead-ins (`**Concept:** explanation…`) instead of nested lists.

### Code and numbers
- Inline code (`` ` ``) for variable names, file paths, and short commands.
- Fenced code blocks for multi-line code.
- Format currency as `$60,000` (no decimals for whole amounts).
- Format percentages as `4%` (no space).
- Use a non-breaking thousands separator: `10,000`, not `10000`.

### Blockquotes
Use sparingly. Best for a single sharp sentence you want the reader to remember, or a quoted source.

---

## 4. Image placement

**Hero (featured) image** — required.
- Path: `/blog/hero/<slug>-hero.png` (or `.jpg`).
- Aspect ratio: 16:9. Recommended: 1600×900px. File size under 200 KB.
- Source: drop into `public/blog/hero/`, reference in frontmatter as `featuredImage: "/blog/hero/<slug>-hero.png"`.
- Always include `featuredImageAlt` describing what the image shows. Decorative-only images still need alt text; describe the mood.

**Inline images** — optional.
- Path: `public/blog/inline/<slug>-<short-description>.png`.
- Use Markdown image syntax: `![Alt text describing the chart](/blog/inline/<slug>-foo.png)`.
- Don't pile on inline images. Use them when a chart or diagram earns its place, not as decoration.

**Open Graph image** — optional override.
- If you want a different image for social shares than the hero, drop it in `public/blog/og/<slug>-og.png` (1200×630px) and set `featuredImage` to that path. Default falls back to `/og-default.png` if no image is given.

> **Placeholder warning.** `public/og-default.png` is currently a copy of the square 512×512 favicon. Twitter and LinkedIn will accept it but render it as a small "summary" card instead of the wide "summary_large_image" layout. Replace with a proper 1200×630 PNG before any major launch or campaign.

Always optimize images before committing. Keep the repo small.

---

## 5. Internal and external linking

### Internal links
- Use site-relative paths starting with `/`: `[the calculator](/products)`, `[our 4% rule post](/blog/four-percent-rule)`.
- Never use full URLs (`https://theantfund.com/...`) for internal links.
- Every post should link to at least one other relevant post and to the calculator where appropriate.
- Place at least one internal link to the calculator in any post about retirement, withdrawal rates, or financial independence.

### External links
- Open external links in a new tab is OK but not required. The Markdown renderer does not auto-add `target="_blank"`; that's intentional.
- Link to primary sources. Cite the original paper, the original SEC filing, the original data set — not a secondhand blog summary.
- Don't link to paywalled content without flagging it inline ("(paywall)").

### Anchor text
- Write the link text as a phrase the reader could understand out of context.
- Don't use "click here" or "read more." Describe the destination: `[the 1994 Bengen paper](https://...)`.

---

## 6. Call-to-action placement

Each post should have **one** primary CTA. The CTA is almost always the Monte Carlo calculator.

- Place it at the end of the post, in a single line: `[Try the Monte Carlo retirement calculator →](/products)`.
- Optionally, place an inline CTA mid-post if the math you're explaining directly maps to an input in the calculator.
- Do not stack CTAs. One per post is enough.

The newsletter section on the home page is the secondary subscription channel; we don't repeat the signup form inside posts.

---

## 7. SEO checklist (every post)

Frontmatter:
- [ ] `title` is unique, scannable, and under 60 characters. The full title shown to search engines is `Title — The Ant Fund`, so leave room.
- [ ] `excerpt` is 1–2 sentences, 130–160 characters. This doubles as the meta description.
- [ ] `category` matches one of your existing categories (or you've decided to add a new one deliberately).
- [ ] `tags` are 2–5 lowercase, hyphenated terms.
- [ ] `featuredImage` exists in `public/blog/hero/`.
- [ ] `featuredImageAlt` is descriptive, not just the title.

Body:
- [ ] First `##` heading is within the first 200 words.
- [ ] At least one internal link to another post or to a calculator.
- [ ] One primary keyword phrase appears in the title, the first paragraph, and at least one `##` heading. Don't stuff.
- [ ] Reading time looks reasonable in the preview (long posts: aim for 6–10 min; short ones: 3–5 min).

Generated automatically (no action needed):
- Canonical URL via the `<Seo>` component.
- Open Graph + Twitter card.
- JSON-LD `Article` schema.
- Sitemap entry on next build.
- RSS feed entry on next build.

---

## 8. Accessibility checklist (every post)

- [ ] Every image has alt text. Decorative images get a description of mood; informational images get a description of content.
- [ ] Headings are in order — no skipping `##` to `####`.
- [ ] Links describe their destination (no "click here").
- [ ] Color is never the only signal. If you reference "the teal line" in a chart, also reference its label.
- [ ] Tables have a header row.
- [ ] Embedded charts have a one-sentence text summary above or below them.

---

## 9. Markdown conventions

- Use ATX-style headings (`## Heading`), not Setext.
- Use `-` for unordered list bullets, not `*` or `+`.
- Use `**bold**` for emphasis (not `__bold__`).
- Use `*italics*` for titles of works and emphasis (not `_italics_`).
- Use GFM tables (the renderer has `remark-gfm` enabled).
- Smart quotes (`"` `'`) are fine — write them directly.
- Em-dashes are fine. Use `—` (real em-dash), not `--`.
- No trailing whitespace, no tab indentation.

---

## 10. Asset organization (the convention)

```
public/blog/
  hero/        — featured images shown at the top of each post and on cards (16:9, ≤200KB)
  inline/      — figures embedded inside posts
  og/          — optional Open Graph overrides (1200×630)
  downloads/   — PDFs, CSVs, anything the reader might want to save
```

Naming convention: `<slug>-<purpose>.<ext>`. Example: `four-percent-rule-hero.png`, `four-percent-rule-distribution.png`. Slugs in filenames keep things grep-able and prevent collisions.

---

## 11. Pre-publish checklist

Before you push:

- [ ] `npm run typecheck` — passes.
- [ ] `npm run lint` — passes.
- [ ] `npm run build` — builds with no errors. Sitemap and RSS should include your new post (the script logs counts).
- [ ] `npm run preview` — visit the new post URL directly. Refresh the page. Check the TOC links land on the right headings. Check prev/next and related posts make sense.
- [ ] Disclaimer is visible in the footer (it always is) and the per-post disclaimer renders.
- [ ] Open the new post URL on your phone or DevTools mobile view. Check the hero image, the TOC (should collapse below the body on mobile), and the share buttons.

Then push to `main`. The site auto-deploys via `.github/workflows/deploy.yml`.

---

## 12. What we are NOT writing

- Stock picks or "best stocks for 2026" posts.
- Predictions of market levels, recessions, or rate moves.
- Personal endorsements of specific funds, brokerages, or platforms (a comparison post that mentions named products factually is fine).
- Content scraped, summarized, or generated wholesale from other sources without original analysis.

Every post should pass one test: would the patient saver — the ant — find this useful, true, and free of hype? If yes, publish. If no, rewrite.
