import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './index.css';

// Recover from stale-deploy chunk errors. When a new version deploys, the old
// hashed JS chunks are removed from the server. A visitor whose tab (or cached
// index.html) still points at an old chunk will get "Failed to fetch
// dynamically imported module" the moment a lazy route tries to load. Vite
// fires `vite:preloadError` in exactly that case — reload once to pull the
// fresh module graph. A short sessionStorage cooldown prevents reload loops if
// the asset is genuinely unreachable (offline, real 404).
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const KEY = 'preload-error-reload-at';
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last > 10_000) {
      sessionStorage.setItem(KEY, String(Date.now()));
      window.location.reload();
    }
  });
}

export const createRoot = ViteReactSSG({
  routes,
  basename: import.meta.env.BASE_URL,
});
