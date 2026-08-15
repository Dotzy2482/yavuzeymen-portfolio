/**
 * The running lap-time readout.
 *
 * Shows the *real* lap time, not the animation time. A 12-second animation can
 * be counting out an eight-minute lap; the number the visitor reads must be
 * the one that was actually set.
 *
 * TODO: format via formatLapTime once implemented.
 * TODO: write the value straight to the DOM node from a MotionValue — this
 *       updates every frame and must not re-render React.
 * TODO: flash the accent colour when the lap completes.
 */

import { cn } from '@/lib/cn';

export interface LapTimerProps {
  /** Elapsed real lap time in ms. */
  elapsedMs: number;
  /** The full lap time in ms, shown as the target/record. */
  totalMs: number;
  /** Render at reduced size, for the list rather than the panel. */
  compact?: boolean;
  className?: string;
}

export function LapTimer({ elapsedMs, totalMs, compact = false, className }: LapTimerProps) {
  // TODO: replace with formatLapTime(elapsedMs) / formatLapTime(totalMs).
  void elapsedMs;
  void totalMs;

  return (
    <div className={cn('lap-timer', compact && 'lap-timer--compact', className)}>
      <span className="num" aria-live="off">
        --:--.---
      </span>
    </div>
  );
}
