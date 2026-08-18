/**
 * Infinite leftward marquee — the hero's sponsor strip.
 *
 * The track renders its children twice and translates from 0 to −50% of its
 * own width, so the loop is seamless at any content width. Under reduced
 * motion the strip is static.
 */

import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks';

export interface MarqueeProps {
  children: React.ReactNode;
  /** Seconds per full cycle. The design's tweakable prop (42s desktop). */
  duration?: number;
  className?: string;
  /** Classes for each of the two copies of the track. */
  trackClassName?: string;
}

export function Marquee({ children, duration = 42, className, trackClassName }: MarqueeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className="flex w-max"
        animate={prefersReducedMotion ? undefined : { x: '-50%' }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        <div className={cn('flex items-center', trackClassName)}>{children}</div>
        <div className={cn('flex items-center', trackClassName)} aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
