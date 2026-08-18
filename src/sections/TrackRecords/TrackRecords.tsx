/**
 * 04 — TRACK RECORDS: section shell for the track-records feature — the
 * centrepiece of the site.
 *
 * This file owns only the section chrome (anchor, heading, spacing). All the
 * behaviour lives behind the feature module's single public export, which is
 * why it is imported under an alias here. The feature itself is not
 * implemented yet — its architecture is being decided separately.
 */

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { TrackRecords as TrackRecordsFeature } from '@/features/track-records';
import type { SectionProps } from '@/types';

export function TrackRecords({ id = 'track-records', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section container-wide', className)}>
      <SectionHeading index="04" title="Track Records" meta="PERSONAL BESTS — GT3 / IRACING" />
      <TrackRecordsFeature />
    </section>
  );
}
