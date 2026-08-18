/**
 * Reports whether an element has entered the viewport. The trigger for every
 * reveal animation and counter on the page.
 *
 * Attach the returned `ref` to the element you want to observe.
 *
 * Under prefers-reduced-motion the hook reports "in view" immediately, so
 * content is never hidden behind an animation that will not run.
 */

import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

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
  options: UseInViewOptions = {},
): UseInViewResult<T> {
  const { threshold = 0.2, rootMargin, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, prefersReducedMotion]);

  // Reduced motion reports "visible" without ever observing.
  return { ref, inView: prefersReducedMotion || inView };
}
