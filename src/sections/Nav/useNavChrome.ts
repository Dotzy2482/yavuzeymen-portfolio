/**
 * The two facts the nav chrome reacts to, each a boolean that changes a
 * handful of times per visit rather than per frame — so, like the scroll-spy,
 * they are allowed to be React state.
 *
 * - `usePageScrolled` — whether the page has left its very top. The mobile bar
 *   is fixed and would otherwise be transparent, drawing the wordmark straight
 *   onto whatever scrolls under it; this is what gives it a background.
 * - `useSectionPassed` — whether a section has scrolled up and out from under
 *   a fixed bar of a given height. The desktop bar waits for the hero to go.
 *
 * Neither is an animation, so neither consults reduced motion: where the page
 * is is the same with or without it. The components that *show* the result
 * decide how fast to get there.
 */

import { useEffect, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';

import type { SectionId } from '@/types';

export function usePageScrolled(): boolean {
  const { scrollY } = useScroll();
  // Seeded from the live position, so a reload that restores a mid-page
  // scroll starts with the background already in place.
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0);

  // Fires on every scroll frame, but React bails out of a same-value update,
  // so the bar re-renders only on the two frames that cross the top.
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 0));

  return scrolled;
}

/**
 * True once section `id` has scrolled up past the bottom edge of a fixed bar
 * `offset` pixels tall — the moment its last pixel would slide under the bar.
 *
 * An IntersectionObserver whose root is the viewport minus the bar: no scroll
 * handler and no per-frame measuring, one callback each time the edge is
 * crossed. It is not `useActiveSection`, whose observer answers a different
 * question ("which listed section holds the middle of the screen?") and goes
 * dark in the six sections the nav does not list.
 */
export function useSectionPassed(id: SectionId, offset: number): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const section = document.getElementById(id);
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Out of the root *and above it*. A section below the fold is out of
        // the root too, but it has not been passed.
        setPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= offset);
      },
      { rootMargin: `${-offset}px 0px 0px 0px` },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [id, offset]);

  return passed;
}
