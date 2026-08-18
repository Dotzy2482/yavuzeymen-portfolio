/**
 * Moves its children at a different rate to the scroll, creating depth.
 *
 * Writes to a MotionValue via useTransform, so no React re-render happens per
 * frame. Disabled on small screens and under reduced motion — parallax is the
 * first thing to cut when frames get expensive.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

import { cn } from '@/lib/cn';
import { BREAKPOINTS } from '@/lib/constants';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks';

export interface ParallaxLayerProps {
  children: React.ReactNode;
  /**
   * Movement rate relative to the scroll.
   * `0` = pinned to the page, `1` = normal scroll, `<1` = slower (further
   * away), `>1` = faster (closer). Negative values move against the scroll.
   */
  speed?: number;
  /** Axis to move on. Default `'y'`. */
  axis?: 'x' | 'y';
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  axis = 'y',
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery(BREAKPOINTS.md);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Total drift over the element's pass through the viewport, in px.
  const drift = (1 - speed) * 120;
  const offset = useTransform(scrollYProgress, [0, 1], [drift, -drift]);

  if (prefersReducedMotion || !isDesktop) {
    return (
      <div ref={ref} className={cn('parallax-layer', className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn('parallax-layer will-change-transform', className)}
      style={axis === 'y' ? { y: offset } : { x: offset }}
    >
      {children}
    </motion.div>
  );
}
