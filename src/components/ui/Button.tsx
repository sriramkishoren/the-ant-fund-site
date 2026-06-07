import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center rounded-md font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-teal disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-amber text-ink hover:bg-gold shadow-sm',
  secondary: 'border border-teal text-teal-dark hover:bg-teal/5',
  ghost: 'text-teal-dark hover:bg-teal/5',
};

const sizes: Record<Size, string> = {
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

function cls(variant: Variant, size: Size, extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={cls(variant, size, className)} {...rest}>
      {children}
    </button>
  );
});

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  children: ReactNode;
};

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  external = false,
  className = '',
  children,
  ...rest
}: LinkButtonProps) {
  if (external) {
    return (
      <a
        href={to}
        className={cls(variant, size, className)}
        rel="noopener noreferrer"
        target="_blank"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
