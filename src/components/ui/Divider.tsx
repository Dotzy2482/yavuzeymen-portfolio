/**
 * Horizontal or vertical rule between content blocks.
 *
 * Decorative by default, so it is hidden from assistive technology.
 *
 * TODO: implement the animated draw-in (scaleX from 0) on scroll into view.
 */

import { cn } from '@/lib/cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Draw the rule in when it enters the viewport. */
  animated?: boolean;
  className?: string;
}

export function Divider({ orientation = 'horizontal', animated = false, className }: DividerProps) {
  // TODO: `animated` is not wired up yet.
  void animated;

  return (
    <hr
      aria-hidden="true"
      className={cn('divider', `divider--${orientation}`, className)}
      data-orientation={orientation}
    />
  );
}
