/**
 * Reads the geometry of the currently rendered circuit path.
 *
 * The total length is measured once per track (getTotalLength() is not free)
 * and re-measured whenever the `d` attribute changes. Everything downstream —
 * the progress dash, the trail, the dot — is derived from it.
 */

import { useCallback, useRef } from 'react';

import { getPathLength, getPointAtDistance } from '../lib/svgPath';
import type { PathPoint } from '../data/types';

export interface UsePathPointResult {
  /** Total length of the path currently in the element, memoised per `d`. */
  measure: (path: SVGPathElement | null, d: string) => number;
  /** Point + heading at an absolute distance along the path. */
  pointAt: (path: SVGPathElement | null, distance: number) => PathPoint;
  /** Forces the next measure() to re-read, e.g. after a resize. */
  invalidate: () => void;
}

export function usePathPoint(): UsePathPointResult {
  const cachedD = useRef<string | null>(null);
  const cachedLength = useRef(0);

  const measure = useCallback((path: SVGPathElement | null, d: string) => {
    if (cachedD.current !== d) {
      cachedD.current = d;
      cachedLength.current = getPathLength(path);
    }
    return cachedLength.current;
  }, []);

  const pointAt = useCallback(
    (path: SVGPathElement | null, distance: number) => getPointAtDistance(path, distance),
    [],
  );

  const invalidate = useCallback(() => {
    cachedD.current = null;
  }, []);

  return { measure, pointAt, invalidate };
}
