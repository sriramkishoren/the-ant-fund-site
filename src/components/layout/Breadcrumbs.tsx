import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  /** Omit for the current page (rendered as plain text). */
  to?: string;
}

type Props = {
  items: Crumb[];
  className?: string;
};

export function Breadcrumbs({ items, className = '' }: Props) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-ink/65 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <li>
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className="text-teal-dark no-underline hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className="text-ink/70">
                    {crumb.label}
                  </span>
                )}
              </li>
              {!isLast ? (
                <li aria-hidden="true" className="text-ink/40">
                  /
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
