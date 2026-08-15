/**
 * Turns a normalised lap position into screen coordinates on the circuit path.
 *
 * This is what makes the car marker follow the actual outline rather than a
 * hand-authored keyframe track: given the <path> element and a 0–1 progress
 * value, it returns the point and the tangent angle at that position.
 *
 * TODO: implement on top of lib/svgPath.ts (getPointAt).
 * TODO: derive the angle from two closely-spaced samples — SVG gives no
 *       tangent directly.
 * TODO: read from a MotionValue and write via `useTransform` so this does not
 *       cost a React render per frame.
 */

import type { PathPoint } from '../data/types';

export interface UsePathPointOptions {
  /** Ref to the circuit outline path. */
  pathRef: React.RefObject<SVGPathElement | null>;
  /** Position along the lap, 0–1. */
  progress: number;
  /** Track's startFinishOffset, so progress 0 lands on the line. */
  offset?: number;
}

export function usePathPoint(_options: UsePathPointOptions): PathPoint {
  // Stub: origin, no rotation.
  return { x: 0, y: 0, angle: 0 };
}
