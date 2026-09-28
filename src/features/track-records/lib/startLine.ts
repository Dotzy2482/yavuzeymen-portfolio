/**
 * Placement of the start/finish tick and its `S/F` label, read off the outline.
 *
 * The design drew every circuit with its start on a horizontal straight
 * heading right, so it could get away with an upright tick and a label 16
 * units ahead and 22 above. Real circuits start on straights pointing every
 * which way: at Zandvoort or Watkins Glen that upright tick lies *along* the
 * track, and the label sits on top of it.
 *
 * Every generated path starts on the start/finish line, and its first segment
 * runs down the straight in the direction of travel (see `trackPaths.ts`). So
 * the direction of that segment is the direction of travel across the line,
 * and the tick is turned to cross it. The label keeps the design's offset —
 * 16 ahead, 22 to one side — turned with the straight, on the side facing away
 * from the driver plate: at rest the dot sits on the line, and the plate
 * beside it would otherwise cover the label. The text then grows away from
 * the track, so it never lands on the line it names.
 *
 * Pure string maths, no geometry API: it renders the same in jsdom and on the
 * first frame, before the lap loop has measured anything.
 */

import { TRACK_VIEW_WIDTH } from '../data/types';

/** The design's label offset, in viewBox units. */
export const START_LABEL_AHEAD = 16;
export const START_LABEL_ASIDE = 22;

/**
 * Past this fraction of the map's width the driver plate flips to the left of
 * the dot. Mirrors LABEL_FLIP_AT in `useLapAnimation.ts`; the map is always
 * as wide as its viewBox scales to, so a viewBox x maps straight onto it.
 */
const PLATE_FLIPS_AT = 0.66;

export interface StartLineMarker {
  /** Degrees to turn the tick; 0 is upright, across a straight heading right. */
  tickAngle: number;
  /** Label anchor relative to the start point, in viewBox units. */
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'end';
  dominantBaseline: 'auto' | 'hanging';
}

const FIRST_SEGMENT = /^\s*M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*L?\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/;

function firstSegment(d: string): [number, number, number, number] | null {
  const match = FIRST_SEGMENT.exec(d);
  if (!match) return null;
  const [x0, y0, x1, y1] = match.slice(1).map(Number);
  return x0 === x1 && y0 === y1 ? null : [x0, y0, x1, y1];
}

/**
 * Direction of travel at the start of the path, in degrees, measured as SVG
 * draws angles: 0 points right, 90 points down. Falls back to 0 — the design's
 * own orientation — for a path whose first segment cannot be read.
 */
export function getStartDirection(d: string): number {
  const segment = firstSegment(d);
  if (!segment) return 0;
  const [x0, y0, x1, y1] = segment;
  return (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
}

export function getStartLineMarker(d: string): StartLineMarker {
  const angle = getStartDirection(d);
  const startX = firstSegment(d)?.[0] ?? 0;
  const radians = (angle * Math.PI) / 180;
  const ahead = { x: Math.cos(radians), y: Math.sin(radians) };

  // The two sides of the track, as unit normals, and the anchor each would give.
  const sides = [
    { x: ahead.y, y: -ahead.x },
    { x: -ahead.y, y: ahead.x },
  ].map((normal) => ({
    normal,
    x: START_LABEL_AHEAD * ahead.x + START_LABEL_ASIDE * normal.x,
    y: START_LABEL_AHEAD * ahead.y + START_LABEL_ASIDE * normal.y,
  }));

  // The plate sits right of the dot unless the start is far enough right to
  // flip it; take the side further from it. On a straight too close to level
  // for that to decide, go above the track, as the design did.
  const plateOnRight = startX <= PLATE_FLIPS_AT * TRACK_VIEW_WIDTH;
  const [first, second] = sides;
  const side =
    Math.abs(first.x - second.x) < 1
      ? first.y <= second.y
        ? first
        : second
      : first.x < second.x === plateOnRight
        ? first
        : second;

  const round = (value: number) => Math.round(value * 10) / 10 || 0;
  return {
    tickAngle: round(angle),
    labelX: round(side.x),
    labelY: round(side.y),
    // Grow the text away from the track, never back across it.
    textAnchor: side.normal.x >= -1e-9 ? 'start' : 'end',
    dominantBaseline: side.normal.y <= 1e-9 ? 'auto' : 'hanging',
  };
}
