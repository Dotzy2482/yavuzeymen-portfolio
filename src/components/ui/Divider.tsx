/**
 * Horizontal or vertical hairline between content blocks.
 *
 * Decorative, so it is hidden from assistive technology. Static on purpose:
 * the site's scroll language is scrub-linked, not entrance reveals.
 */

import { cn } from '@/lib/cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <hr
      aria-hidden="true"
      className={cn(
        'bg-hairline-mid border-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  );
}
