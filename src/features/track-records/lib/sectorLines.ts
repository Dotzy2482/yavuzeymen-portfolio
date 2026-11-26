/**
 * Placement of the sector ticks — where S2 and S3 begin — and their labels,
 * read off the outline.
 *
 * `track.sectors` gives each timing line as a fraction of the path's length.
 * The path is a plain polyline (`M x yL x y … Z`, see `trackPaths.ts`), so the
 * point at a fraction and the direction of travel there are string maths on
 * `d`, like the S/F tick in `startLine.ts`: it renders the same in jsdom and on
 * the first frame, and never waits for the lap loop to measure anything.
 *
 * Each tick is a smaller cousin of the S/F tick, turned across the track; its
 * label sits 18 units to one side and grows away from the track. Of the two
 * sides, the one that keeps the label on the canvas, then the one that sits
 * further from every other part of the lap — a tick on a hairpin or beside a
 * parallel straight would otherwise put its label on the next piece of track.
 *
 * docs/assets/generate-track-paths.mjs mirrors this placement and refuses to
 * write a circuit whose sector tick or label would be clipped.
 */

import { TRACK_VIEW_HEIGHT, TRACK_VIEW_WIDTH, type SectorSplits } from '../data/types';

/** Label offset from the tick, in viewBox units. */
export const SECTOR_LABEL_ASIDE = 18;
/**
 * Label size in viewBox units: the S/F label's 22 below `md`, where the map
 * is drawn a third the size, and 16 above it, a step down from S/F. Placement
 * and the clipping check use the larger.
 */
export const SECTOR_LABEL_SIZE = { phone: 22, desktop: 16 } as const;
/** Tick size, in viewBox units: narrow along the track, long across it. */
export const SECTOR_TICK = { width: 5, length: 24 } as const;

/** The sectors each line begins. S1 begins on the start/finish line. */
const SECTOR_NAMES = ['S2', 'S3'] as const;

// Estimated generously — two glyphs of a wide mono face, plus ascent — because
// the only mistake worth catching is a clipped label.
const LABEL_WIDTH = 2 * 0.7 * SECTOR_LABEL_SIZE.phone;
const LABEL_HEIGHT = 0.8 * SECTOR_LABEL_SIZE.phone;

type Point = readonly [number, number];

export interface SectorMarker {
  label: (typeof SECTOR_NAMES)[number];
  /** The point on the line, in viewBox units. */
  x: number;
  y: number;
  /** Degrees to turn the tick; 0 is upright, across a straight heading right. */
  tickAngle: number;
  /** Label anchor relative to the point. */
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'end';
  dominantBaseline: 'auto' | 'hanging';
}

/** The vertices of a polyline path. Anything that is not one comes back empty. */
export function parsePolyline(d: string): Point[] {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const points: Point[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
  return points;
}

/** Point and direction of travel (radians, SVG angles) at a fraction of a closed polyline. */
export function pointAtFraction(
  points: readonly Point[],
  fraction: number,
): { x: number; y: number; angle: number } {
  const segments = points.map((p, i) => {
    const q = points[(i + 1) % points.length];
    return { p, q, length: Math.hypot(q[0] - p[0], q[1] - p[1]) };
  });
  const total = segments.reduce((sum, s) => sum + s.length, 0);
  let remaining = fraction * total;
  for (const [i, s] of segments.entries()) {
    if (s.length === 0) continue;
    if (remaining <= s.length || i === segments.length - 1) {
      const t = Math.min(1, remaining / s.length);
      return {
        x: s.p[0] + t * (s.q[0] - s.p[0]),
        y: s.p[1] + t * (s.q[1] - s.p[1]),
        angle: Math.atan2(s.q[1] - s.p[1], s.q[0] - s.p[0]),
      };
    }
    remaining -= s.length;
  }
  return { x: points[0]?.[0] ?? 0, y: points[0]?.[1] ?? 0, angle: 0 };
}

function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distanceToPolyline(points: readonly Point[], point: Point): number {
  let best = Infinity;
  points.forEach((p, i) => {
    best = Math.min(best, distanceToSegment(point, p, points[(i + 1) % points.length]));
  });
  return best;
}

const onCanvas = ([x, y]: Point) =>
  x >= 0 && x <= TRACK_VIEW_WIDTH && y >= 0 && y <= TRACK_VIEW_HEIGHT;

const round = (value: number) => Math.round(value * 10) / 10 || 0;

export function getSectorMarkers(d: string, sectors: SectorSplits): SectorMarker[] {
  const points = parsePolyline(d);
  if (points.length < 2) return [];

  return sectors.map((fraction, i) => {
    const { x, y, angle } = pointAtFraction(points, fraction);
    const ahead: Point = [Math.cos(angle), Math.sin(angle)];
    const across: Point = [ahead[1], -ahead[0]];

    const tick: Point[] = [];
    for (const a of [-SECTOR_TICK.width / 2, SECTOR_TICK.width / 2]) {
      for (const l of [-SECTOR_TICK.length / 2, SECTOR_TICK.length / 2]) {
        tick.push([x + a * ahead[0] + l * across[0], y + a * ahead[1] + l * across[1]]);
      }
    }

    const sides = [across, [-across[0], -across[1]] as Point].map((normal) => {
      const anchor: Point = [
        x + SECTOR_LABEL_ASIDE * normal[0],
        y + SECTOR_LABEL_ASIDE * normal[1],
      ];
      // Grow the text away from the track, never back across it.
      const dx = normal[0] >= -1e-9 ? LABEL_WIDTH : -LABEL_WIDTH;
      const dy = normal[1] <= 1e-9 ? -LABEL_HEIGHT : LABEL_HEIGHT;
      const box: Point[] = [
        ...tick,
        anchor,
        [anchor[0] + dx, anchor[1]],
        [anchor[0], anchor[1] + dy],
        [anchor[0] + dx, anchor[1] + dy],
      ];
      return {
        normal,
        anchor,
        clipped: !box.every(onCanvas),
        clearance: distanceToPolyline(points, [anchor[0] + dx / 2, anchor[1] + dy / 2]),
      };
    });

    const [first, second] = sides;
    const side =
      first.clipped !== second.clipped
        ? first.clipped
          ? second
          : first
        : second.clearance > first.clearance + 1e-6
          ? second
          : first;

    return {
      label: SECTOR_NAMES[i],
      x: round(x),
      y: round(y),
      tickAngle: round((angle * 180) / Math.PI),
      labelX: round(side.anchor[0] - x),
      labelY: round(side.anchor[1] - y),
      textAnchor: side.normal[0] >= -1e-9 ? 'start' : 'end',
      dominantBaseline: side.normal[1] <= 1e-9 ? 'auto' : 'hanging',
    };
  });
}

/** The label's box relative to its anchor, for the clipping test. */
export const SECTOR_LABEL_BOX = { width: LABEL_WIDTH, height: LABEL_HEIGHT } as const;
