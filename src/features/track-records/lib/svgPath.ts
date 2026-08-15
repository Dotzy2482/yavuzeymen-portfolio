/**
 * SVG path geometry helpers for the circuit outline.
 *
 * All of these wrap the browser's SVGGeometryElement API
 * (`getTotalLength()` / `getPointAtLength()`), which is what lets the car
 * marker follow an arbitrary circuit shape without hand-authored keyframes.
 *
 * TODO: implement all of these.
 * TODO: memoise total length per path element — getTotalLength() is not free
 *       and the value only changes when the track changes.
 * TODO: jsdom implements none of this; guard so tests do not explode.
 */

import type { PathPoint, SectorSplit } from '../data/types';

/** Total path length in user units. Returns 0 when unavailable. */
export function getPathLength(_path: SVGPathElement | null): number {
  return 0;
}

/**
 * Point and heading at a normalised position along the path.
 *
 * @param progress 0–1 along the path.
 * @param offset   Rotates the origin so 0 lands on the start/finish line.
 */
export function getPointAt(
  _path: SVGPathElement | null,
  _progress: number,
  _offset: number = 0,
): PathPoint {
  return { x: 0, y: 0, angle: 0 };
}

/**
 * Splits a path into the three sector sub-paths, for drawing sector-coloured
 * segments over the outline.
 *
 * Returns stroke-dasharray/dashoffset pairs rather than new `d` strings —
 * dashing one path is far cheaper than rendering three.
 */
export function getSectorDashes(
  _totalLength: number,
  _sectors: SectorSplit,
): Array<{ dasharray: string; dashoffset: number }> {
  return [];
}

/** Wraps a progress value into the 0–1 range (2.25 → 0.25, -0.1 → 0.9). */
export function wrapProgress(_progress: number): number {
  return 0;
}
