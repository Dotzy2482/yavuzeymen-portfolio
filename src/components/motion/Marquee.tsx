/**
 * Infinite leftward marquee — the hero's sponsor strip.
 *
 * The track renders its children N times and translates left by exactly one
 * copy's width per cycle, so the loop is seamless.
 *
 * N is measured, not assumed. Two copies are only enough when a single copy is
 * already at least as wide as the viewport: translating by one copy width
 * exposes that much space on the right, and if the content cannot fill it the
 * strip runs dry and the tail of the bar goes empty before snapping back. The
 * hero's four sponsor logos come to ~600px against a ~1200px bar, which is
 * exactly that failure. So the count is `ceil(viewport / copy) + 1`, remeasured
 * on resize and as the logos finish decoding.
 *
 * Cycle speed is unaffected by N: one cycle always travels one copy width,
 * because `100 / N` percent of an N-copy track *is* one copy. `duration` keeps
 * meaning "seconds to advance the strip by one copy".
 *
 * A consumer must let this fill its container — in a flex row that means
 * `className="flex-1 min-w-0"`. Sized to content instead, the viewport grows
 * with the copy count and the measurement chases itself; MAX_COPIES bounds the
 * damage.
 *
 * Under reduced motion the strip is static.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks';

/** Two copies is the minimum that can loop at all. */
const MIN_COPIES = 2;
/**
 * Safety net, not a design constraint. Nothing legitimate needs this many; it
 * exists so a consumer that sizes the viewport to its content cannot spiral.
 */
const MAX_COPIES = 12;

export interface MarqueeProps {
  children: React.ReactNode;
  /** Seconds to advance the strip by one copy. The design's tweakable (42s). */
  duration?: number;
  className?: string;
  /** Classes for each copy of the track. Trailing padding sets the seam gap. */
  trackClassName?: string;
}

export function Marquee({ children, duration = 42, className, trackClassName }: MarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(MIN_COPIES);

  useEffect(() => {
    const viewport = viewportRef.current;
    const copy = copyRef.current;
    if (!viewport || !copy) return;

    const measure = () => {
      const copyWidth = copy.getBoundingClientRect().width;
      const viewportWidth = viewport.getBoundingClientRect().width;
      // Before the logos decode a copy can measure zero. Keep the current count
      // rather than dividing by it; the observer fires again once they land.
      if (copyWidth <= 0) return;
      const needed = Math.ceil(viewportWidth / copyWidth) + 1;
      setCopies(Math.min(MAX_COPIES, Math.max(MIN_COPIES, needed)));
    };

    measure();
    // The copy is observed too, not just the viewport: its width is what
    // changes when an image finishes decoding or a font swaps in.
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(copy);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={viewportRef} className={cn('overflow-hidden', className)}>
      <motion.div
        className="flex w-max"
        animate={prefersReducedMotion ? undefined : { x: `-${100 / copies}%` }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? copyRef : undefined}
            className={cn('flex items-center', trackClassName)}
            aria-hidden={i === 0 ? undefined : 'true'}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
