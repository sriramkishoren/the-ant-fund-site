type Props = {
  items: string[];
  title?: string;
  /** Compact variant for inside a chapter page. */
  dense?: boolean;
};

/** Shared agenda rendering — used at both course and chapter level. */
export function AgendaList({ items, title = "What we'll cover", dense = false }: Props) {
  if (items.length === 0) return null;
  return (
    <div
      className={`rounded-xl border border-border bg-cream/50 ${dense ? 'p-4' : 'p-5 sm:p-6'}`}
    >
      <h2
        className={`font-heading font-semibold text-teal-dark ${dense ? 'text-base' : 'text-lg'}`}
      >
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/85">
            <span
              aria-hidden="true"
              className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
