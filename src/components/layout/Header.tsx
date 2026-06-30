import { NavLink, Link } from 'react-router-dom';
import { Container } from './Container';
import { withBase } from '@/lib/basePath';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium no-underline hover:text-teal ${
    isActive ? 'text-teal-dark' : 'text-ink'
  }`;

export function Header() {
  return (
    <header className="border-b border-border bg-cream/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          to="/"
          aria-label="The Ant Fund — home"
          className="flex items-center gap-2.5 no-underline"
        >
          <img
            src={withBase('ant-logo.svg')}
            alt=""
            width={48}
            height={36}
            className="h-9 w-auto"
          />
          <span className="font-heading text-xl font-semibold text-teal-dark">
            the ant fund
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/tools" className={navLinkClass}>
            Tools
          </NavLink>
          <NavLink to="/blog" className={navLinkClass}>
            Blog
          </NavLink>
        </nav>
      </Container>
    </header>
  );
}
