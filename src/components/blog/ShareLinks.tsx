import { absoluteUrl } from '@/lib/seo';

// Plain anchor share links — no third-party SDKs, no tracking pixels, no JS
// required for the share intent itself. Clipboard copy uses navigator.clipboard
// when available and silently no-ops if not (e.g. during SSR).
export function ShareLinks({ path, title }: { path: string; title: string }) {
  const url = absoluteUrl(path);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-teal-dark no-underline hover:underline"
      >
        X / Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-teal-dark no-underline hover:underline"
      >
        LinkedIn
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="text-sm text-teal-dark no-underline hover:underline"
      >
        Email
      </a>
      <button
        type="button"
        onClick={() => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(url);
          }
        }}
        className="text-sm text-teal-dark hover:underline"
      >
        Copy link
      </button>
    </div>
  );
}
