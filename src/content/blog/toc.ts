import GithubSlugger from 'github-slugger';

export interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

// Extract h2/h3 headings from a Markdown body. IDs match what rehype-slug
// produces so anchor links from the TOC land on the rendered headings.
// Skips ATX headings inside fenced code blocks.
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const out: TocEntry[] = [];
  let inCode = false;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    // Strip basic Markdown emphasis markers so the TOC text reads cleanly.
    const text = m[2].replace(/[*_`]/g, '').trim();
    const id = slugger.slug(text);

    out.push({ level, text, id });
  }

  return out;
}
