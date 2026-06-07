import type { BlogPost } from '../types';

// Content body deliberately left as a placeholder until the Blog page is built.
// Metadata is populated so the home-page "Latest Articles" section can render
// real cards without rework when the full article is written.
const post: BlogPost = {
  title: 'How Monte Carlo simulation answers the question every retiree asks',
  slug: 'monte-carlo-explained',
  author: 'The Ant Fund',
  date: '2026-05-12',
  category: 'Retirement',
  excerpt:
    'A single average return hides the question that actually matters: how often does the plan run out of money? Monte Carlo answers it ten thousand times over.',
  featuredImage: '/og-default.png',
  content: '',
};

export default post;
