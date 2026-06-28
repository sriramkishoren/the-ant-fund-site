import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';
import { getAllSlugs } from '@/content/blog';

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
        path: 'products',
        lazy: () => import('@/pages/Products').then((m) => ({ Component: m.default })),
        entry: 'src/pages/Products.tsx',
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
