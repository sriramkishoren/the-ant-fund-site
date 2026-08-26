import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../parseFrontmatter';

const wrap = (fm: string, body = 'Body text.') => `---\n${fm}\n---\n\n${body}`;

describe('parseFrontmatter — scalars', () => {
  it('reads quoted and bare strings and numbers', () => {
    const { data, body } = parseFrontmatter(
      wrap('title: "Cash-secured puts"\ncourse: options-trading\norder: 3'),
    );
    expect(data.title).toBe('Cash-secured puts');
    expect(data.course).toBe('options-trading');
    expect(data.order).toBe(3);
    expect(body).toBe('Body text.');
  });

  it('throws on malformed input so a typo fails the build', () => {
    expect(() => parseFrontmatter('no frontmatter here')).toThrow();
    expect(() => parseFrontmatter(wrap('bare line without colon'))).toThrow();
  });
});

describe('parseFrontmatter — inline arrays', () => {
  it('splits on commas outside quotes only', () => {
    const { data } = parseFrontmatter(
      wrap('agenda: ["Strikes, deltas and DTE", "Rolling a losing put"]'),
    );
    // Would have been three broken items before quote-aware splitting.
    expect(data.agenda).toEqual(['Strikes, deltas and DTE', 'Rolling a losing put']);
  });

  it('still handles simple unquoted lists', () => {
    const { data } = parseFrontmatter(wrap('tags: [options, wheel, puts]'));
    expect(data.tags).toEqual(['options', 'wheel', 'puts']);
  });

  it('handles an empty array', () => {
    expect(parseFrontmatter(wrap('tags: []')).data.tags).toEqual([]);
  });
});

describe('parseFrontmatter — block lists', () => {
  it('reads indented dash items verbatim, commas and all', () => {
    const { data } = parseFrontmatter(
      wrap(
        [
          'title: "Chapter"',
          'agenda:',
          '  - What a CSP obligates you to, exactly',
          '  - Choosing a strike, and what delta says',
          '  - The three ways it goes wrong',
          'order: 1',
        ].join('\n'),
      ),
    );
    expect(data.agenda).toEqual([
      'What a CSP obligates you to, exactly',
      'Choosing a strike, and what delta says',
      'The three ways it goes wrong',
    ]);
    // keys after the block still parse
    expect(data.order).toBe(1);
    expect(data.title).toBe('Chapter');
  });

  it('does not mistake a bare key for a block list', () => {
    const { data } = parseFrontmatter(wrap('description:\ntitle: "X"'));
    expect(data.description).toBe('');
    expect(data.title).toBe('X');
  });

  it('strips quotes from block items when present', () => {
    const { data } = parseFrontmatter(wrap('agenda:\n  - "Quoted: with a colon"'));
    expect(data.agenda).toEqual(['Quoted: with a colon']);
  });
});
