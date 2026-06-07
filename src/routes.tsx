import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';

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
        path: '*',
        lazy: () => import('@/pages/NotFound').then((m) => ({ Component: m.default })),
        entry: 'src/pages/NotFound.tsx',
      },
    ],
  },
];
