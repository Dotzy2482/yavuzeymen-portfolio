/**
 * Titles, wins, podiums and poles — the headline stat row plus the detail
 * list behind it.
 *
 * TODO: build the stat row from `achievementTotals` using <StatValue animate />.
 * TODO: build the detail grid from `achievements`.
 * TODO: decide whether the detail list is always visible or expands.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function Achievements({ id = 'achievements', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="04" title="Achievements" />
      {/* TODO: stat row + detail grid from src/data/achievements.ts */}
    </section>
  );
}
