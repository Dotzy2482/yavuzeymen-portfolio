/**
 * Reports whether an element has entered the viewport. The trigger for every
 * reveal animation on the page.
 *
 * Attach the returned `ref` to the element you want to observe.
 *
 * TODO: implement with IntersectionObserver.
 * TODO: support `once` (unobserve after the first intersection) so reveals do
 *       not replay on scroll-up.
 * TODO: return early as "in view" when prefers-reduced-motion is set, so
 *       content is never hidden behind an animation that will not run.
 */

import { useRef } from 'react';

export interface UseInViewOptions {
  /** Fraction of the element that must be visible. Default 0.2. */
  threshold?: number;
  /** IntersectionObserver rootMargin, e.g. `'0px 0px -15% 0px'`. */
  rootMargin?: string;
  /** Stop observing after the first intersection. Default true. */
  once?: boolean;
}

export interface UseInViewResult<T extends Element> {
  ref: React.RefObject<T | null>;
  inView: boolean;
}

export function useInView<T extends Element = HTMLElement>(
  _options: UseInViewOptions = {},
): UseInViewResult<T> {
  const ref = useRef<T | null>(null);

  // Stub: always reports "visible" so nothing is hidden before implementation.
  return { ref, inView: true };
}
