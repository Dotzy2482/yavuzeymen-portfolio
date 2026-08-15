/**
 * Normalised scroll progress, 0 → 1.
 *
 * With no target, reports progress through the whole document (drives the nav
 * progress bar). With a target ref, reports progress of that element through
 * the viewport (drives parallax and section-scoped reveals).
 *
 * TODO: implement on top of motion's `useScroll`, or a scroll listener with
 *       rAF throttling if motion's version proves too coarse.
 * TODO: return a MotionValue instead of a number — a raw number re-renders on
 *       every frame, which is exactly what this site cannot afford.
 */

export interface UseScrollProgressOptions {
  /** Element to measure. Omit to measure the document. */
  target?: React.RefObject<Element | null>;
  /** Scroll offsets, motion-style, e.g. `['start end', 'end start']`. */
  offset?: [string, string];
}

export function useScrollProgress(_options: UseScrollProgressOptions = {}): number {
  // Stub: page reads as "at the top" until implemented.
  return 0;
}
