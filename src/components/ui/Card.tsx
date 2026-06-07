import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
};

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={`rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </Tag>
  );
}
