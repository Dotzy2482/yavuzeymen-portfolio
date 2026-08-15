/**
 * The dot travelling around the circuit outline.
 *
 * Positioned from the path geometry via usePathPoint, not from CSS keyframes —
 * that is what lets one component work for any circuit shape.
 *
 * TODO: replace the placeholder circle with the real marker (car silhouette or
 *       a glowing dot with a trailing tail).
 * TODO: rotate by `angle` so the marker faces its direction of travel.
 * TODO: drive position through a MotionValue instead of React state.
 */

import { usePathPoint } from '../hooks/usePathPoint';

export interface CarMarkerProps {
  /** Ref to the circuit outline the marker follows. */
  pathRef: React.RefObject<SVGPathElement | null>;
  /** Position around the lap, 0–1. */
  progress: number;
  /** Track's startFinishOffset. */
  offset?: number;
  className?: string;
}

export function CarMarker({ pathRef, progress, offset = 0, className }: CarMarkerProps) {
  const point = usePathPoint({ pathRef, progress, offset });

  return (
    <circle
      className={className}
      cx={point.x}
      cy={point.y}
      r={8}
      fill="var(--accent-primary)"
      // TODO: transform={`rotate(${point.angle} ${point.x} ${point.y})`}
    />
  );
}
