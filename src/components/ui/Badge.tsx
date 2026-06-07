import type { ReactNode } from 'react';

type Tone = 'teal' | 'amber' | 'neutral';

const tones: Record<Tone, string> = {
  teal: 'bg-teal/10 text-teal-dark',
  amber: 'bg-amber/15 text-ink',
  neutral: 'bg-ink/5 text-ink/80',
};

export function Badge({
  children,
  tone = 'teal',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
