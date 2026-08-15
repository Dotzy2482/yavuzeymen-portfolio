/**
 * Animates a number from `from` to `to` when it scrolls into view.
 *
 * Used by the Achievements and Content stat rows.
 *
 * TODO: implement with motion's `animate()` on a MotionValue and write the
 *       formatted result straight to the DOM node — re-rendering React 60
 *       times a second for a counter is not acceptable.
 * TODO: under reduced motion, render the final value immediately.
 *
 * Renders the final value with no animation for now, which is also the correct
 * reduced-motion behaviour.
 */

import { cn } from '@/lib/cn';

export interface CountUpProps {
  /** Target value. */
  to: number;
  /** Starting value. Default 0. */
  from?: number;
  /** Duration in seconds. Defaults to DURATION.slow. */
  duration?: number;
  /** Decimal places to display. Default 0. */
  decimals?: number;
  /** Rendered before/after the number. */
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ to, prefix, suffix, className }: CountUpProps) {
  return (
    <span className={cn('num', className)}>
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
