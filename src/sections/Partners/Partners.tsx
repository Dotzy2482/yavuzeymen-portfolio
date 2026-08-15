/**
 * Sponsor and partner logo wall, ordered by tier.
 *
 * TODO: implement the logo grid with a hover treatment.
 * TODO: only render a logo once its usage rights are confirmed — anything
 *       unresolved stays in the git-ignored public/images/private/.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import type { SectionProps } from '@/types';

export function Partners({ id = 'partners', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="08" title="Partners" />
      {/* TODO: logo wall from src/data/partners.ts */}
    </section>
  );
}
