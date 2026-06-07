import { NavLink, Link } from 'react-router-dom';
import { Container } from './Container';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium no-underline hover:text-teal ${
    isActive ? 'text-teal-dark' : 'text-ink'
  }`;

export function Header() {
  return (
    <header className="border-b border-border bg-cream/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="font-heading text-xl font-semibold text-teal-dark no-underline">
          {/* TODO: swap text wordmark for ant + wordmark SVG lockup when available */}
          the ant fund
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
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
