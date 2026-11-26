/**
 * The circuit map: three stacked strokes of the same path plus the moving
 * marker.
 *
 * Layers, bottom to top:
 *  1. base outline (dim) — also the element every measurement reads from,
 *  2. cyan progress, revealed by a growing dash,
 *  3. bright trail, a short dash pinned to the dot,
 *  4. sector ticks where S2 and S3 begin, the start/finish tick, and the car
 *     marker.
 *
 * The sector ticks are the circuit's real timing lines (see `track.sectors`),
 * placed by string maths on the path, so they are on screen from the first
 * frame and never move: there is nothing for reduced motion to stop.
 *
 * The overlaid driver plate is HTML, positioned in panel pixels by the
 * animation loop — hence the tagged wrapper.
 */

import { CarMarker } from './CarMarker';
import { DriverLabel } from './DriverLabel';
import { TRACK_VIEWBOX, type SectorSplits } from '../data/types';
import { LAP_NODE } from '../hooks/useLapAnimation';
import { SECTOR_TICK, getSectorMarkers } from '../lib/sectorLines';
import { getStartLineMarker } from '../lib/startLine';

export interface TrackMapProps {
  /** The active circuit's `d` attribute. */
  path: string;
  /** Where S2 and S3 begin, as fractions of the path's length. */
  sectors: SectorSplits;
  /** Accessible description — the map itself is decorative geometry. */
  trackName: string;
  driverName: string;
}

export function TrackMap({ path, sectors, trackName, driverName }: TrackMapProps) {
  const marker = getStartLineMarker(path);
  const sectorMarkers = getSectorMarkers(path, sectors);

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
        {sectorMarkers.map((sector) => (
          <g
            key={sector.label}
            data-sector-line={sector.label}
            transform={`translate(${sector.x},${sector.y})`}
          >
            <rect
              x={-SECTOR_TICK.width / 2}
              y={-SECTOR_TICK.length / 2}
              width={SECTOR_TICK.width}
              height={SECTOR_TICK.length}
              fill="var(--text)"
              opacity="0.6"
              transform={`rotate(${sector.tickAngle})`}
            />
            <text
              x={sector.labelX}
              y={sector.labelY}
              textAnchor={sector.textAnchor}
              dominantBaseline={sector.dominantBaseline}
              fill="var(--track-sf)"
              fontFamily="var(--font-mono)"
              className="[font-size:22px] md:[font-size:16px]"
            >
              {sector.label}
            </text>
          </g>
        ))}
        {/* The loop translates the group onto the line; the tick is turned
            across the direction of travel, and the label kept off the track. */}
        <g data-lap={LAP_NODE.startFinish}>
          <rect
            x="-4"
            y="-18"
            width="8"
            height="36"
            fill="var(--text)"
            opacity="0.85"
            transform={`rotate(${marker.tickAngle})`}
          />
          <text
            x={marker.labelX}
            y={marker.labelY}
            textAnchor={marker.textAnchor}
            dominantBaseline={marker.dominantBaseline}
            fill="var(--track-sf)"
            fontFamily="var(--font-mono)"
            fontSize="22"
          >
            S/F
          </text>
        </g>
        <CarMarker />
      </svg>
      <DriverLabel name={driverName} />
    </div>
  );
}
