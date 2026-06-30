import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';
import { getAllSlugs } from '@/content/blog';
import { getLiveToolSlugs } from '@/features/tools/registry';

export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        lazy: () => import('@/pages/Home').then((m) => ({ Component: m.default })),
        entry: 'src/pages/Home.tsx',
      },
      {
        path: 'tools',
        lazy: () => import('@/pages/Tools').then((m) => ({ Component: m.default })),
        entry: 'src/pages/Tools.tsx',
      },
      {
        path: 'tools/:slug',
        lazy: () => import('@/pages/ToolPage').then((m) => ({ Component: m.default })),
        entry: 'src/pages/ToolPage.tsx',
        // Same pattern as blog/:slug — return the FULL path including the
        // parent prefix so each live tool pre-renders to its own .html file.
        getStaticPaths: () => getLiveToolSlugs().map((slug) => `tools/${slug}`),
      },
      {
        path: 'blog',
        lazy: () => import('@/pages/Blog').then((m) => ({ Component: m.default })),
        entry: 'src/pages/Blog.tsx',
      },
      {
        path: 'blog/:slug',
        lazy: () => import('@/pages/BlogPost').then((m) => ({ Component: m.default })),
        entry: 'src/pages/BlogPost.tsx',
        // vite-react-ssg passes each returned string through handlePath() with
        // the parent prefix, so we return the FULL path (with the "blog/"
        // segment) — not just the bare slug — to get /blog/<slug>/index.html.
        getStaticPaths: () => getAllSlugs().map((slug) => `blog/${slug}`),
      },
      {
        path: '*',
        lazy: () => import('@/pages/NotFound').then((m) => ({ Component: m.default })),
        entry: 'src/pages/NotFound.tsx',
      },
    ],
  },
];
