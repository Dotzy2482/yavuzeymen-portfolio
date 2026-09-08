/**
 * Barrel for the motion wrappers.
 *
 * Reveal, Stagger and ParallaxLayer used to live here and were removed: nothing
 * imported them. The design brief asks for scrub-linked scroll effects rather
 * than time-based entrances, so the two reveal wrappers had no work to do, and
 * the parallax layer never found a caller either. Git has them if that changes.
 *
 * StretchScrub is the counter-example, and the test it passes is worth stating
 * because those three failed it. Its three call sites (Setup, Partners,
 * Contact) would otherwise each re-derive the same non-obvious handling: which
 * of `font-stretch` and `font-variation-settings` wins, why the driving value
 * has to be published as a custom property rather than set directly, the axis
 * unit mismatch, the integer quantisation, and the reduced-motion fallback.
 * That is shared *knowledge*, not a shared `useTransform`.
 *
 * The bars in those same three sections are the other side of it. Three call
 * sites also want "an element whose extent tracks scroll", and they are
 * deliberately not abstracted: Career animates `height`, Setup's underline
 * `scaleX`, Contact's finish line `width` — because `shadow-glow-line`
 * distorts under a transform. Parameterising over that is more code than the
 * one `useTransform` it would replace.
 */

export { CountUp } from './CountUp';
export type { CountUpProps } from './CountUp';

export { Marquee } from './Marquee';
export type { MarqueeProps } from './Marquee';

export { Pinned } from './Pinned';
export type { PinnedProps } from './Pinned';

export { StretchScrub } from './StretchScrub';
export type { StretchScrubProps } from './StretchScrub';
