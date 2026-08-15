/**
 * Moves its children at a different rate to the scroll, creating depth.
 *
 * TODO: implement with useScrollProgress + motion's `useTransform`, writing to
 *       a MotionValue so no React re-render happens per frame.
 * TODO: disable outright on touch/small screens and under reduced motion —
 *       parallax is the first thing to cut when frames get expensive.
 */

import { cn } from '@/lib/cn';

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

export function ParallaxLayer({ children, className }: ParallaxLayerProps) {
  return <div className={cn('parallax-layer', className)}>{children}</div>;
}
