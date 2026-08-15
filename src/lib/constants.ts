/**
 * App-wide constants: section order, navigation labels, breakpoints and the
 * shared animation timing vocabulary.
 *
 * Section order here is the source of truth — App.tsx renders in this order and
 * the nav highlights against it.
 */

import type { NavItem, SectionId } from '@/types';

/** Document order of the single page. */
export const SECTION_IDS = [
  'hero',
  'about',
  'track-records',
  'career',
  'achievements',
  'sim-to-real',
  'content',
  'setup',
  'partners',
  'contact',
] as const satisfies readonly SectionId[];

/**
 * Navigation entries.
 * TODO: settle the final copy — these labels are placeholders.
 * TODO: decide whether every section appears in the nav or only a subset.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'track-records', label: 'Track Records' },
  { id: 'career', label: 'Career' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'sim-to-real', label: 'Sim to Real' },
  { id: 'content', label: 'Content' },
  { id: 'setup', label: 'Setup' },
  { id: 'partners', label: 'Partners' },
  { id: 'contact', label: 'Contact' },
];

/** Breakpoints, mirroring Tailwind's defaults. Used by useMediaQuery. */
export const BREAKPOINTS = {
  sm: '(min-width: 40rem)',
  md: '(min-width: 48rem)',
  lg: '(min-width: 64rem)',
  xl: '(min-width: 80rem)',
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/** Media query used by usePrefersReducedMotion. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Shared motion timing, in seconds (motion/framer-motion units).
 * TODO: reconcile with the CSS duration tokens in styles/tokens.css.
 */
export const DURATION = {
  fast: 0.15,
  base: 0.32,
  slow: 0.7,
} as const;

/** Default easing curve for reveal-style animations. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Default gap between children in a staggered reveal, in seconds. */
export const STAGGER_STEP = 0.08;
