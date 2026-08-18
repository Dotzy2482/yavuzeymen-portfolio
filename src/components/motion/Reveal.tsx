/**
 * Reveals its children when they scroll into view.
 *
 * NOTE: the design brief says scroll effects are scrub-linked, not time-based
 * entrances — so this is used sparingly (stat cards, grids), never on whole
 * sections.
 *
 * Under reduced motion the children render at rest, immediately visible.
 */

import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { DURATION, EASE_OUT } from '@/lib/constants';
import { usePrefersReducedMotion } from '@/hooks';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSETS: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: {},
};

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

export function Reveal({
  children,
  direction = 'up',
  distance = 24,
  delay = 0,
  duration = DURATION.base,
  repeat = false,
  className,
}: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn('reveal', className)}>{children}</div>;
  }

  const offset = OFFSETS[direction];

  return (
    <motion.div
      className={cn('reveal', className)}
      initial={{
        opacity: 0,
        x: (offset.x ?? 0) * distance,
        y: (offset.y ?? 0) * distance,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: !repeat, amount: 0.2 }}
      transition={{ duration, delay, ease: [...EASE_OUT] }}
    >
      {children}
    </motion.div>
  );
}
