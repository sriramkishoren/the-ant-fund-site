import { useState } from 'react';

type Props = {
  cape: number;
  asOf: string;
  isOverride: boolean;
  defaultCape: number;
  onChange: (cape: number | undefined) => void;
};

export function CapeIndicator({ cape, asOf, isOverride, defaultCape, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cape.toFixed(2));

  function commit() {
    const n = Number(draft);
    if (Number.isFinite(n) && n > 0) {
      onChange(n);
    }
    setEditing(false);
  }

  function reset() {
    onChange(undefined);
    setDraft(defaultCape.toFixed(2));
    setEditing(false);
  }

  return (
    <div className="rounded-md border border-border bg-cream/40 px-3 py-2 text-xs text-ink/75">
      {editing ? (
        <span className="flex items-center gap-2">
          <span className="text-teal-dark">CAPE override</span>
          <input
            type="number"
            value={draft}
            min={1}
            step={0.1}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-20 rounded border border-border bg-surface px-2 py-0.5 text-ink focus:border-teal focus-visible:outline-none"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <button
            type="button"
            onClick={commit}
            className="text-teal-dark hover:underline"
          >
            save
          </button>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span>
            CAPE today{' '}
            <span className="font-medium text-teal-dark">{cape.toFixed(1)}</span>
            {isOverride ? <span className="ml-1 text-amber">(override)</span> : (
              <span className="ml-1 text-ink/55">(as of {asOf})</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              setDraft(cape.toFixed(2));
              setEditing(true);
            }}
            className="text-teal underline-offset-2 hover:underline"
          >
            {isOverride ? 'edit' : 'override'}
          </button>
          {isOverride ? (
            <button
              type="button"
              onClick={reset}
              className="text-ink/60 hover:text-teal hover:underline"
            >
              reset
            </button>
          ) : null}
        </span>
      )}
    </div>
  );
}
