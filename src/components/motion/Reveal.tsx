/**
 * Reveals its children when they scroll into view — the default entrance for
 * essentially every block on the page.
 *
 * TODO: implement with motion's `<motion.div>` + `whileInView`, driven by the
 *       `direction`/`distance` props.
 * TODO: skip the animation entirely (render at rest) when
 *       usePrefersReducedMotion() is true. Content must never stay invisible.
 *
 * Renders its children unwrapped-but-visible for now so the page is readable
 * while the design is being finished.
 */

import { cn } from '@/lib/cn';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface RevealProps {
  children: React.ReactNode;
  /** Where the content travels from. Default `'up'`. */
  direction?: RevealDirection;
  /** Travel distance in pixels. Default 24. */
  distance?: number;
  /** Delay before starting, in seconds. */
  delay?: number;
  /** Duration in seconds. Defaults to DURATION.base. */
  duration?: number;
  /** Replay every time it re-enters the viewport. Default false. */
  repeat?: boolean;
  className?: string;
}

export function Reveal({ children, className }: RevealProps) {
  return <div className={cn('reveal', className)}>{children}</div>;
}
