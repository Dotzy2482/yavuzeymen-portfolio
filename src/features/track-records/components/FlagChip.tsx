/**
 * The country chip next to a circuit name — a CSS-gradient flag.
 *
 * The gradient itself is decorative, so it carries the country name as a
 * visually-hidden label instead of being hidden outright: the flag is the
 * only place the country appears, and a circuit list that silently drops it
 * for screen-reader users is a list missing a column.
 *
 * The chip is `relative` for that label's sake. `sr-only` is
 * `position: absolute`, so without a positioned ancestor it resolves against
 * the initial containing block — which puts it outside the mobile chip row's
 * scroller for the purpose of clipping, and every chip past the fold then
 * stretches the document's scrollWidth to where its label happens to sit. One
 * invisible 1px span is enough to make the whole page scroll sideways.
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
        'border-border-flag relative inline-flex shrink-0 border',
        size === 'md' ? 'rounded-flag h-[13px] w-5' : 'h-3 w-[18px]',
        className,
      )}
      style={{ background: flag }}
    >
      <span className="sr-only">{name}</span>
    </span>
  );
}
