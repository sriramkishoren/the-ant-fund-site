// Minimal YAML-ish frontmatter parser. Intentionally tiny — we control the
// authoring format so we only support: `key: value`, `key: "value"`,
// `key: [a, b, c]`, `key: 12`, and block lists:
//
//   agenda:
//     - First item, commas and all
//     - Second item
//
// No nesting, no anchors, no multi-line scalars.
// Throws on malformed input so a typo fails the build instead of silently
// producing an empty field.

export interface ParsedFrontmatter {
  data: Record<string, string | number | string[]>;
  body: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Decode the few backslash escapes we permit inside quoted strings: \" \' \\
// \n. Without this an author can't put a literal quote inside a quoted title
// without it leaking into the rendered HTML as \&quot;.
function unescape(s: string): string {
  return s.replace(/\\(["'\\n])/g, (_, ch: string) =>
    ch === 'n' ? '\n' : ch,
  );
}

function parseScalar(raw: string): string | number {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return unescape(trimmed.slice(1, -1));
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return unescape(t.slice(1, -1));
  }
  return t;
}

/**
 * Split on commas that sit outside quotes, so an item may contain a comma:
 * `["Strikes, deltas and DTE", "Rolling"]` is two items, not three.
 */
function splitTopLevel(inner: string): string[] {
  const out: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      if (ch === '\\' && i + 1 < inner.length) {
        current += ch + inner[++i];
        continue;
      }
      if (ch === quote) quote = null;
      current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ',') {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function parseArray(raw: string): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (!inner) return [];
  return splitTopLevel(inner).map(stripQuotes);
}

export function parseFrontmatter(source: string): ParsedFrontmatter {
  const match = FRONTMATTER_RE.exec(source);
  if (!match) {
    throw new Error('Missing frontmatter block (expected leading --- ... --- fence)');
  }
  const [, yaml, body] = match;
  const data: Record<string, string | number | string[]> = {};

  const lines = yaml.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.replace(/\s+#.*$/, '');
    if (!line.trim()) continue;

    // Block list: `key:` on its own line, then indented `- item` lines. Items
    // are taken verbatim (commas included) up to an optional trailing comment.
    const blockKey = /^([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (blockKey && /^\s*-\s+/.test(lines[i + 1] ?? '')) {
      const items: string[] = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        items.push(stripQuotes(lines[++i].replace(/^\s*-\s+/, '').replace(/\s+#.*$/, '')));
      }
      data[blockKey[1]] = items;
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) {
      throw new Error(`Malformed frontmatter line (no colon): ${rawLine}`);
    }
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (!key) {
      throw new Error(`Malformed frontmatter line (empty key): ${rawLine}`);
    }
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = parseArray(value);
    } else {
      data[key] = parseScalar(value);
    }
  }

  return { data, body: body.replace(/^\r?\n/, '') };
}
