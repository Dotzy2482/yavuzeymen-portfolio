/**
 * The sim-to-real story: what transfers from the rig to a real car.
 *
 * TODO: settle the content model — this is currently the least-defined
 *       section. Likely a side-by-side sim/real comparison.
 * TODO: add a data file under src/data/ once the shape is known.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function SimToReal({ id = 'sim-to-real', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="05" title="Sim to Real" />
      {/* TODO: content model undecided */}
    </section>
  );
}
