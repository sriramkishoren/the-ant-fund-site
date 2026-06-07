import { Link } from 'react-router-dom';
import { Container } from './Container';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="py-10 text-sm text-ink/80">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-heading text-lg text-teal-dark">the ant fund</p>
            <p className="mt-2 max-w-xs">
              Slow, steady wealth for everyday investors.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">Explore</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link to="/products" className="no-underline hover:underline">
                  Calculators
                </Link>
              </li>
              <li>
                <Link to="/blog" className="no-underline hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-ink">Stay in touch</p>
            <p className="mt-2">Subscribe from the home page for occasional updates.</p>
          </div>
        </div>
        <p className="mt-10 text-xs leading-relaxed text-ink/70">
          The Ant Fund publishes educational content and tools for informational
          purposes only. It is not financial, investment, tax, or legal advice.
        </p>
        <p className="mt-2 text-xs text-ink/60">© {year} The Ant Fund. All rights reserved.</p>
      </Container>
    </footer>
  );
}
