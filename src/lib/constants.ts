/**
 * App-wide constants: section order, navigation labels, breakpoints and the
 * shared animation timing vocabulary.
 *
 * Section order here is the source of truth: App.tsx renders in this order.
 * The nav highlights against it, but only for the four sections NAV_ITEMS
 * lists — see useActiveSection for what that costs and buys.
 */

import type { NavItem, SectionId } from '@/types';

/** Document order of the single page — the design's 01–09 numbering. */
export const SECTION_IDS = [
  'hero',
  'about', // 01 WHO IS
  'career', // 02
  'achievements', // 03
  'track-records', // 04
  'sim-to-real', // 05
  'content', // 06
  'setup', // 07
  'partners', // 08
  'contact', // 09
] as const satisfies readonly SectionId[];

/**
 * Navigation entries — the design's "PAGES" column: a curated four, not every
 * section, and deliberately not in document order: Career is second in the
 * document and last here.
 *
 * Both are design decisions the scroll-spy adapts to rather than the other way
 * round. Six of the ten sections have no entry here, and while the reader is
 * in one of those the nav highlights nothing at all.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'hero', label: 'Home' },
  { id: 'track-records', label: 'On Track' },
  { id: 'sim-to-real', label: 'Sim to Real' },
  { id: 'career', label: 'Career' },
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
