/**
 * The circuit outline SVG, with the car marker running around it.
 *
 * Owns the ref to the <path>; CarMarker and usePathPoint both read geometry
 * from it, so it must not be recreated on every render.
 *
 * TODO: draw the outline with a stroke-dashoffset draw-in when the track
 *       changes.
 * TODO: overlay the three sector segments in distinct colours.
 * TODO: mark the start/finish line using track.startFinishOffset.
 * TODO: add aria-hidden — this is a decorative diagram; the numbers next to it
 *       carry the actual information.
 */

import { useRef } from 'react';

import { cn } from '@/lib/cn';

import { CarMarker } from './CarMarker';
import type { Track } from '../data/types';

export interface TrackMapProps {
  track: Track;
  /** Car position around the lap, 0–1. */
  progress: number;
  className?: string;
}

export function TrackMap({ track, progress, className }: TrackMapProps) {
  const pathRef = useRef<SVGPathElement | null>(null);

  return (
    <svg
      viewBox={track.viewBox}
      className={cn('track-map', className)}
      role="img"
      aria-label={`${track.name} circuit layout`}
    >
      <path
        ref={pathRef}
        d={track.svgPath}
        fill="none"
        stroke="var(--border)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* TODO: sector overlay paths go here, under the marker. */}
      <CarMarker pathRef={pathRef} progress={progress} offset={track.startFinishOffset} />
    </svg>
  );
}
