/**
 * Normalised scroll progress, 0 → 1, as React state.
 *
 * With no target, reports progress through the whole document. With a target
 * ref, reports progress of that element through the viewport.
 *
 * NOTE: this re-renders on scroll (motion batches updates to animation
 * frames, so at most once per frame). Fine for coarse consumers like a nav
 * highlight; anything running per-frame transforms (hero, pinned galleries)
 * must use motion's `useScroll` MotionValue directly instead — the pinned
 * sections do exactly that via <Pinned />.
 */

import { useState } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';

export interface UseScrollProgressOptions {
  /** Element to measure. Omit to measure the document. */
  target?: React.RefObject<Element | null>;
  /** Scroll offsets, motion-style, e.g. `['start end', 'end start']`. */
  offset?: [string, string];
}

export function useScrollProgress(options: UseScrollProgressOptions = {}): number {
  const { target, offset = ['start end', 'end start'] } = options;

  const { scrollYProgress } = useScroll({
    ...(target ? { target: target as React.RefObject<HTMLElement> } : {}),
    offset: offset as ['start end', 'end start'],
  });

  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', setProgress);

  return progress;
}
