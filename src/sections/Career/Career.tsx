/**
 * Career timeline, newest first.
 *
 * TODO: implement the vertical timeline (rail, nodes, per-entry reveal).
 * TODO: render `career` entries with formatYearRange once implemented.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function Career({ id = 'career', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="03" title="Career" />
      {/* TODO: timeline built from src/data/career.ts */}
    </section>
  );
}
