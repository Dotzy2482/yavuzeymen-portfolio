/**
 * Horizontal or vertical hairline between content blocks.
 *
 * Decorative by default, so it is hidden from assistive technology. With
 * `animated`, the rule draws in (scaleX from 0) when it enters the viewport.
 */

import { motion } from 'motion/react';

import { cn } from '@/lib/cn';
import { DURATION, EASE_OUT } from '@/lib/constants';
import { usePrefersReducedMotion } from '@/hooks';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Draw the rule in when it enters the viewport. */
  animated?: boolean;
  className?: string;
}

export function Divider({ orientation = 'horizontal', animated = false, className }: DividerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const classes = cn(
    'border-0 bg-hairline-mid',
    orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
    className,
  );

  if (animated && !prefersReducedMotion) {
    return (
      <motion.hr
        aria-hidden="true"
        className={cn(classes, orientation === 'horizontal' ? 'origin-left' : 'origin-top')}
        initial={{
          scaleX: orientation === 'horizontal' ? 0 : 1,
          scaleY: orientation === 'vertical' ? 0 : 1,
        }}
        whileInView={{ scaleX: 1, scaleY: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: DURATION.slow, ease: [...EASE_OUT] }}
      />
    );
  }

  return <hr aria-hidden="true" className={classes} />;
}
