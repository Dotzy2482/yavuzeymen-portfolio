/**
 * Reveals its direct children one after another rather than all at once.
 *
 * Pairs with <Reveal /> for the child elements: this component owns the
 * timing, <Reveal /> owns the movement.
 *
 * TODO: implement with a motion variants parent (`staggerChildren`) so the
 *       delay is computed by motion rather than by index maths here.
 * TODO: honour prefers-reduced-motion — collapse to an instant reveal.
 */

import { cn } from '@/lib/cn';

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

export function Stagger({ children, as: Element = 'div', className }: StaggerProps) {
  return <Element className={cn('stagger', className)}>{children}</Element>;
}
