/**
 * The circuit map: three stacked strokes of the same path plus the moving
 * marker.
 *
 * Layers, bottom to top:
 *  1. base outline (dim) — also the element every measurement reads from,
 *  2. cyan progress, revealed by a growing dash,
 *  3. bright trail, a short dash pinned to the dot,
 *  4. start/finish tick, and the car marker.
 *
 * The overlaid driver plate is HTML, positioned in panel pixels by the
 * animation loop — hence the tagged wrapper.
 */

import { CarMarker } from './CarMarker';
import { DriverLabel } from './DriverLabel';
import { TRACK_VIEWBOX } from '../data/types';
import { LAP_NODE } from '../hooks/useLapAnimation';

export interface TrackMapProps {
  /** The active circuit's `d` attribute. */
  path: string;
  /** Accessible description — the map itself is decorative geometry. */
  trackName: string;
  driverName: string;
}

export function TrackMap({ path, trackName, driverName }: TrackMapProps) {
  return (
    <div data-lap={LAP_NODE.map} className="relative mt-4 md:mt-6">
      <svg
        viewBox={TRACK_VIEWBOX}
        role="img"
        aria-label={`${trackName} pist haritası`}
        className="block h-auto w-full"
      >
        <path
          data-lap={LAP_NODE.base}
          d={path}
          fill="none"
          stroke="var(--track-base)"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="md:[stroke-width:3]"
        />
        <path
          data-lap={LAP_NODE.progress}
          d={path}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="md:[stroke-width:3.5]"
        />
        <path
          data-lap={LAP_NODE.trail}
          d={path}
          fill="none"
          stroke="var(--track-trail)"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
          className="md:[stroke-width:5]"
        />
        <g data-lap={LAP_NODE.startFinish}>
          <rect x="-4" y="-18" width="8" height="36" fill="var(--text)" opacity="0.85" />
          <text x="16" y="-22" fill="var(--track-sf)" fontFamily="var(--font-mono)" fontSize="22">
            S/F
          </text>
        </g>
        <CarMarker />
      </svg>
      <DriverLabel name={driverName} />
    </div>
  );
}
