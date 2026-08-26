/**
 * The chronometer. Its text is written by the animation loop, so the initial
 * render is just a zeroed placeholder at the right width.
 *
 * Tabular figures are mandatory here — without them the panel header shifts
 * on every frame.
 *
 * `aria-live="off"` is stated rather than left implicit. `role="timer"` already
 * implies it, but this text changes sixty times a second: if any assistive
 * technology treats the role as polite instead, it would read the chronometer
 * aloud on every frame. Not worth leaving to interpretation.
 */

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui';

import { LAP_NODE } from '../hooks/useLapAnimation';

export interface LapTimerProps {
  className?: string;
}

export function LapTimer({ className }: LapTimerProps) {
  return (
    <div className={cn('shrink-0 md:text-right', className)}>
      <MonoLabel size="xs" tracking="xl" as="div" lang="en">
        Lap time
      </MonoLabel>
      <div
        data-lap={LAP_NODE.chrono}
        role="timer"
        aria-live="off"
        aria-label="Tur süresi"
        className="num text-text mt-1.5 text-[38px] font-medium whitespace-nowrap md:text-[clamp(26px,3.2vw,44px)]"
      >
        0:00.000
      </div>
    </div>
  );
}
