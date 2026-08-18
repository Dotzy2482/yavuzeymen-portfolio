/**
 * SVG path geometry helpers for the circuit outline.
 *
 * All of these wrap the browser's SVGGeometryElement API
 * (`getTotalLength()` / `getPointAtLength()`), which is what lets the car
 * marker follow an arbitrary circuit shape without hand-authored keyframes.
 *
 * jsdom implements none of it, so every call is feature-detected and degrades
 * to a zero value rather than throwing in tests.
 */

import type { PathPoint, SectorIndex } from '../data/types';

const ORIGIN: PathPoint = { x: 0, y: 0, angle: 0 };

function supportsGeometry(path: SVGPathElement | null): path is SVGPathElement {
  return (
    path !== null &&
    typeof path.getTotalLength === 'function' &&
    typeof path.getPointAtLength === 'function'
  );
}

/** Total path length in user units. Returns 0 when unavailable. */
export function getPathLength(path: SVGPathElement | null): number {
  if (!supportsGeometry(path)) return 0;
  try {
    return path.getTotalLength();
  } catch {
    return 0;
  }
}

/** Point at an absolute distance along the path, with the tangent heading. */
export function getPointAtDistance(path: SVGPathElement | null, distance: number): PathPoint {
  if (!supportsGeometry(path)) return ORIGIN;
  try {
    const total = path.getTotalLength();
    if (total <= 0) return ORIGIN;
    const d = wrapDistance(distance, total);
    const point = path.getPointAtLength(d);
    // Sample slightly ahead for the tangent; wrap so the seam stays smooth.
    const ahead = path.getPointAtLength(wrapDistance(d + 1, total));
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
    return { x: point.x, y: point.y, angle };
  } catch {
    return ORIGIN;
  }
}

/**
 * Point and heading at a normalised position along the path.
 *
 * @param progress 0–1 along the path.
 * @param offset   Rotates the origin so 0 lands on the start/finish line.
 */
export function getPointAt(
  path: SVGPathElement | null,
  progress: number,
  offset: number = 0,
): PathPoint {
  const total = getPathLength(path);
  if (total <= 0) return ORIGIN;
  return getPointAtDistance(path, (wrapProgress(progress) + offset) * total);
}

/**
 * Dash pair that reveals the lap up to `distance`.
 *
 * Drawing progress by dashing one path is far cheaper than re-rendering a
 * sub-path every frame.
 */
export function getProgressDash(distance: number, totalLength: number): string {
  return `${Math.max(0, distance)} ${totalLength}`;
}

/**
 * Dash pair + offset for the bright trail: a fixed-length segment whose
 * leading edge sits exactly on the car dot.
 */
export function getTrailDash(
  distance: number,
  totalLength: number,
  trailLength: number,
): { dasharray: string; dashoffset: number } {
  const segment = Math.min(trailLength, Math.max(0, distance));
  return { dasharray: `${segment} ${totalLength}`, dashoffset: segment - distance };
}

/** Fill ratio (0–1) of one sector bar at a given lap fraction. */
export function getSectorFill(progress: number, sector: SectorIndex): number {
  return Math.min(1, Math.max(0, (progress - sector / 3) * 3));
}

/** Wraps a progress value into the 0–1 range (2.25 → 0.25, -0.1 → 0.9). */
export function wrapProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return ((progress % 1) + 1) % 1;
}

/** Wraps an absolute distance into [0, totalLength). */
export function wrapDistance(distance: number, totalLength: number): number {
  if (totalLength <= 0) return 0;
  return ((distance % totalLength) + totalLength) % totalLength;
}
