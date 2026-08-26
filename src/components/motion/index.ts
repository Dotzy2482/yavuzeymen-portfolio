/**
 * Barrel for the motion wrappers.
 *
 * Reveal, Stagger and ParallaxLayer used to live here and were removed: nothing
 * imported them. The design brief asks for scrub-linked scroll effects rather
 * than time-based entrances, so the two reveal wrappers had no work to do, and
 * the parallax layer never found a caller either. Git has them if that changes.
 */

export { CountUp } from './CountUp';
export type { CountUpProps } from './CountUp';

export { Marquee } from './Marquee';
export type { MarqueeProps } from './Marquee';

export { Pinned } from './Pinned';
export type { PinnedProps } from './Pinned';
