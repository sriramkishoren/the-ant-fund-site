import { useState } from 'react';
import type { SavedStrategy } from '@/features/strategy-builder/storage';

type Props = {
  saved: SavedStrategy[];
  onSave: (name: string) => void;
  onLoad: (entry: SavedStrategy) => void;
  onDelete: (id: string) => void;
  onCopyLink: () => void;
  copied: boolean;
};

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function SavedStrategies({ saved, onSave, onLoad, onDelete, onCopyLink, copied }: Props) {
  const [name, setName] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(name);
    setName('');
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <h3 className="font-heading text-base font-semibold text-teal-dark">Save &amp; share</h3>
        <p className="mt-0.5 text-xs text-ink/55">
          Saved in this browser only — nothing is uploaded. The share link carries the whole
          position, so it works for anyone you send it to.
        </p>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="sb-name" className="sr-only">
          Strategy name
        </label>
        <input
          id="sb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this strategy"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-teal focus-visible:outline-2 focus-visible:outline-teal"
        />
        <button
          type="submit"
          className="flex-shrink-0 rounded-lg bg-amber px-3 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-gold focus-visible:outline-2 focus-visible:outline-teal"
        >
          Save
        </button>
      </form>

      <button
        type="button"
        onClick={onCopyLink}
        className="w-full rounded-lg border border-teal px-3 py-2 text-sm font-medium text-teal-dark transition-colors hover:bg-teal/5 focus-visible:outline-2 focus-visible:outline-teal"
      >
        {copied ? 'Link copied' : 'Copy share link'}
      </button>

      {saved.length > 0 ? (
        <ul className="divide-y divide-border/60">
          {saved.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2">
              <button
                type="button"
                onClick={() => onLoad(s)}
                className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-teal"
              >
                <span className="block truncate text-sm font-medium text-teal-dark hover:underline">
                  {s.name}
                </span>
                <span className="block text-[11px] text-ink/50">
                  {dateFmt.format(new Date(s.savedAt))}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(s.id)}
                className="flex-shrink-0 text-xs text-ink/50 underline-offset-2 hover:text-amber hover:underline focus-visible:outline-2 focus-visible:outline-teal"
                aria-label={`Delete ${s.name}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
