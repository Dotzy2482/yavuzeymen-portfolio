/**
 * The country chip next to a circuit name — a CSS-gradient flag.
 *
 * The gradient itself is decorative, so it carries the country name as a
 * visually-hidden label instead of being hidden outright: the flag is the
 * only place the country appears, and a circuit list that silently drops it
 * for screen-reader users is a list missing a column.
 */

import { cn } from '@/lib/cn';

import { COUNTRIES } from '../data/flags';
import type { CountryCode } from '../data/flags';

export interface FlagChipProps {
  country: CountryCode;
  /** Smaller chip for the mobile track chips. */
  size?: 'sm' | 'md';
  className?: string;
}

export function FlagChip({ country, size = 'md', className }: FlagChipProps) {
  const { name, flag } = COUNTRIES[country];

  return (
    <span
      className={cn(
        'border-border-flag inline-flex shrink-0 border',
        size === 'md' ? 'rounded-flag h-[13px] w-5' : 'h-3 w-[18px]',
        className,
      )}
      style={{ background: flag }}
    >
      <span className="sr-only">{name}</span>
    </span>
  );
}
