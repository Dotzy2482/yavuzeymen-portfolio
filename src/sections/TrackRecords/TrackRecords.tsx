/**
 * Section shell for the track-records feature — the centrepiece of the site.
 *
 * This file owns only the section chrome (anchor, heading, spacing). All the
 * behaviour lives behind the feature module's single public export, which is
 * why it is imported under an alias here.
 *
 * TODO: decide whether this section pins/scroll-jacks while a lap plays.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { TrackRecords as TrackRecordsFeature } from '@/features/track-records';
import type { SectionProps } from '@/types';

export function TrackRecords({ id = 'track-records', className }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <SectionHeading index="02" title="Track Records" />
      <TrackRecordsFeature />
    </section>
  );
}
