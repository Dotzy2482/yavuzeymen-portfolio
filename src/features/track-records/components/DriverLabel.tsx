/**
 * The name/time flag that tracks alongside the car marker.
 *
 * Rendered inside the map SVG, offset from the marker so it never sits on top
 * of the circuit outline.
 *
 * TODO: implement collision avoidance — flip the label to the other side of
 *       the marker when it would run off the viewBox edge.
 * TODO: fade out while the marker is in a tight corner sequence, where the
 *       label thrashes.
 */

export interface DriverLabelProps {
  /** Driver name shown on the flag. */
  name: string;
  /** Live lap time next to the name; omit to show the name alone. */
  timeLabel?: string;
  /** Marker position in viewBox units. */
  x: number;
  y: number;
  className?: string;
}

export function DriverLabel({ name, timeLabel, x, y, className }: DriverLabelProps) {
  return (
    <g className={className} transform={`translate(${x}, ${y})`}>
      {/* TODO: background plate behind the text. */}
      <text x={12} y={-8} fill="var(--text)">
        {name}
      </text>
      {timeLabel && (
        <text x={12} y={8} fill="var(--text-muted)">
          {timeLabel}
        </text>
      )}
    </g>
  );
}
