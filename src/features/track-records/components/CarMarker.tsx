/**
 * The car dot: a bright core inside a soft cyan halo.
 *
 * Renders at the SVG origin and is moved by the animation loop via a
 * `transform` attribute — cheaper than re-rendering cx/cy every frame.
 */

import { LAP_NODE } from '../hooks/useLapAnimation';

export function CarMarker() {
  return (
    <g data-lap={LAP_NODE.dot}>
      <circle r="11" fill="var(--accent-primary)" opacity="0.25" />
      <circle r="5.5" fill="var(--track-dot)" />
    </g>
  );
}
