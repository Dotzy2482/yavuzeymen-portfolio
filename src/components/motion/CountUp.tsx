/**
 * Animates a number from `from` to `to` when it scrolls into view.
 *
 * Implemented with motion's `animate()` writing the formatted result straight
 * to the DOM node — React never re-renders during the count. Formatting is
 * Turkish (dot thousands, comma decimals) via lib/format.
 *
 * Under reduced motion the final value renders immediately (useInView already
 * reports "visible" in that case, and the effect skips the tween).
 */

import { useEffect, useRef } from 'react';
import { animate } from 'motion/react';

import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { DURATION } from '@/lib/constants';
import { useInView, usePrefersReducedMotion } from '@/hooks';

/** easeOutCubic — the curve the design's counters use. */
const COUNT_EASE = [0.33, 1, 0.68, 1] as const;

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

export function CountUp({
  to,
  from = 0,
  duration = DURATION.slow,
  decimals = 0,
  prefix,
  suffix,
  className,
}: CountUpProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5 });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = numberRef.current;
    if (!node || !inView) return;

    if (prefersReducedMotion) {
      node.textContent = formatNumber(to, decimals);
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: [...COUNT_EASE],
      onUpdate: (v) => {
        node.textContent = formatNumber(v, decimals);
      },
    });
    return () => controls.stop();
  }, [inView, prefersReducedMotion, from, to, duration, decimals]);

  return (
    <span ref={ref} className={cn('num', className)}>
      {prefix}
      <span ref={numberRef}>{formatNumber(prefersReducedMotion ? to : from, decimals)}</span>
      {suffix}
    </span>
  );
}
