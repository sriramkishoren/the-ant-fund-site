import { Outlet } from 'react-router-dom';
import { CurrencyProvider } from '@/lib/CurrencyProvider';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <CurrencyProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  );
}
