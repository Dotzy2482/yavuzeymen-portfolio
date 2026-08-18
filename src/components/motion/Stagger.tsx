/**
 * Reveals its direct children one after another rather than all at once.
 *
 * Implemented as a motion variants parent (`staggerChildren`) so timing is
 * computed by motion, with each child wrapped in a variant-consuming
 * motion.div. Under reduced motion everything renders at rest.
 */

import { Children } from 'react';
import { motion, type Variants } from 'motion/react';

import { cn } from '@/lib/cn';
import { DURATION, EASE_OUT, STAGGER_STEP } from '@/lib/constants';
import { usePrefersReducedMotion } from '@/hooks';

const childVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: [...EASE_OUT] },
  },
};

export interface StaggerProps {
  children: React.ReactNode;
  /** Gap between consecutive children, in seconds. Defaults to STAGGER_STEP. */
  step?: number;
  /** Delay before the first child starts, in seconds. */
  delay?: number;
  /** Reverse the order children animate in. */
  reverse?: boolean;
  /** Element to render. Default `'div'`. */
  as?: 'div' | 'ul' | 'ol' | 'section';
  className?: string;
}

export function Stagger({
  children,
  step = STAGGER_STEP,
  delay = 0,
  reverse = false,
  as = 'div',
  className,
}: StaggerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    const Element = as;
    return <Element className={cn('stagger', className)}>{children}</Element>;
  }

  const MotionElement = motion[as];

  return (
    <MotionElement
      className={cn('stagger', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: step,
            delayChildren: delay,
            staggerDirection: reverse ? -1 : 1,
          },
        },
      }}
    >
      {Children.map(children, (child) => (
        <motion.div variants={childVariants}>{child}</motion.div>
      ))}
    </MotionElement>
  );
}
