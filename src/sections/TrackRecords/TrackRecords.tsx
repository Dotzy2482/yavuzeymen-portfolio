/**
 * 04 — TRACK RECORDS: section shell for the track-records feature — the
 * centrepiece of the site.
 *
 * This file owns only the section chrome (anchor, heading, spacing). All the
 * behaviour lives behind the feature module's single public export.
 *
 * That module is the one part of the page loaded as its own chunk. It carries
 * a frame loop, playback state and every circuit's path data — some 31 kB
 * since real geometry landed — and it sits four sections below the fold. `lazy()`
 * takes it off the critical path: the main bundle parses and paints the hero
 * without it, and the chunk is requested as the page first renders, long
 * before anyone can scroll this far.
 *
 * The split sits here rather than around the whole section in App.tsx on
 * purpose. The anchor and the heading are cheap and have to exist from the
 * first render: the nav's scroll-spy finds sections by id once, on mount, and a
 * `#track-records` link has to have somewhere to land. Only the module waits.
 *
 * While it loads, a placeholder holds the module's exact footprint so nothing
 * below it moves when it arrives (see TrackRecordsPlaceholder). A chunk is also
 * a network request, which can fail — so the module gets its own error
 * boundary, and a failed load costs this section rather than the whole page.
 */

import { lazy, Suspense } from 'react';

import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
// The file, not the `@/app` barrel: the barrel re-exports App, which imports
// every section — this one included.
import { ErrorBoundary } from '@/app/ErrorBoundary';
import type { SectionProps } from '@/types';

import { TrackRecordsPlaceholder } from './TrackRecordsPlaceholder';

const TrackRecordsFeature = lazy(() =>
  import('@/features/track-records').then((module) => ({ default: module.TrackRecords })),
);

export function TrackRecords({ id = 'track-records', className }: SectionProps) {
  return (
    <section id={id} className={cn('container-section container-wide', className)}>
      <SectionHeading index="04" title="Track Records" meta="PERSONAL BESTS — GT3 / IRACING" />
      <ErrorBoundary
        label="Track records"
        fallback={
          <TrackRecordsPlaceholder status="Pist kayıtları yüklenemedi. Sayfayı yenilemeyi deneyin." />
        }
      >
        <Suspense fallback={<TrackRecordsPlaceholder />}>
          <TrackRecordsFeature />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
