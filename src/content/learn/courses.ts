import type { Course } from './types';

// Course manifests. Chapters live as markdown under ./chapters and attach
// themselves to a course by slug, so publishing a chapter is a one-file change
// and courses can grow at whatever pace the write-ups arrive.
export const COURSES: Course[] = [
  {
    slug: 'options-trading',
    title: 'Options trading',
    subtitle: 'What the contracts actually are, and where the money really comes from',
    description:
      'A ground-up track through options: the four positions, what you owe versus what you own, how income strategies really earn, and the honest downside of each. Built for someone who has opened an options chain, found a wall of numbers, and closed it again.',
    level: 'Beginner',
    agenda: [
      'Calls, puts, and the four positions — rights versus obligations',
      'Reading an options chain without being overwhelmed',
      'The Greeks, in the order they actually matter',
      'Income strategies: cash-secured puts and covered calls',
      'Intrinsic versus extrinsic value — what you can actually harvest',
      'Risk, assignment, and the ways each position goes wrong',
    ],
    outcomes: [
      'Explain any options position in terms of what you owe and what you own',
      'Read a chain and know which numbers change your decision',
      'Say what a strategy earns, what it caps, and what it risks',
    ],
    relatedPosts: [
      'calls-and-puts-explained',
      'the-wheel-options-foundations',
      'technical-analysis-foundations',
    ],
    relatedTools: [],
    order: 1,
  },
  {
    slug: 'retirement-planning',
    title: 'Retirement planning',
    subtitle: 'How much is enough, and how to draw it down without running out',
    description:
      'The second track: turning a number into a plan. How to size what you need, why the order of returns matters more than the average, and which withdrawal rules actually survive bad decades. Each chapter pairs with a calculator you can run on your own numbers.',
    level: 'Beginner',
    agenda: [
      'Your number: spending, safe withdrawal rates, and the one equation underneath',
      'Sequence-of-returns risk — why the average return is a comforting lie',
      'Monte Carlo: reading a range of futures instead of a single line',
      'Withdrawal strategies: fixed, dynamic, and guardrails',
      'The bucket approach: never selling into a crash',
      'Inflation, taxes, and the things that quietly break plans',
    ],
    outcomes: [
      'Put a defensible number on what financial independence costs you',
      'Read a success rate and a percentile band without over-trusting either',
      'Choose a withdrawal rule that matches how flexible you can actually be',
    ],
    relatedPosts: ['your-fi-number', 'monte-carlo-explained', 'bucket-strategy-retirement'],
    relatedTools: [
      'fire-calculator',
      'monte-carlo-retirement-calculator',
      'bucket-strategy-planner',
      'investment-calculator',
    ],
    order: 2,
  },
];

export function getAllCourses(): Course[] {
  return [...COURSES].sort((a, b) => a.order - b.order);
}

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCourseSlugs(): string[] {
  return getAllCourses().map((c) => c.slug);
}
