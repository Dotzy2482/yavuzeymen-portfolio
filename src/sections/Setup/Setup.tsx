/**
 * The sim rig: hardware and software, grouped by category.
 *
 * TODO: group `setupItems` by category following SETUP_CATEGORY_ORDER.
 * TODO: decide on the visual — spec list, or an exploded diagram of the rig
 *       with hotspots.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function Setup({ id = 'setup', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="07" title="Setup" />
      {/* TODO: grouped list from src/data/setup.ts */}
    </section>
  );
}
