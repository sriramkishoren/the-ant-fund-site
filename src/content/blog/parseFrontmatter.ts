// Minimal YAML-ish frontmatter parser. Intentionally tiny — we control the
// authoring format so we only support: `key: value`, `key: "value"`,
// `key: [a, b, c]`, and `key: 12`. No nesting, no anchors, no multi-line scalars.
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

function parseArray(raw: string): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (!inner) return [];
  return inner.split(',').map((item) => {
    const s = item.trim();
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      return unescape(s.slice(1, -1));
    }
    return s;
  });
}

export function parseFrontmatter(source: string): ParsedFrontmatter {
  const match = FRONTMATTER_RE.exec(source);
  if (!match) {
    throw new Error('Missing frontmatter block (expected leading --- ... --- fence)');
  }
  const [, yaml, body] = match;
  const data: Record<string, string | number | string[]> = {};

  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '');
    if (!line.trim()) continue;
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
