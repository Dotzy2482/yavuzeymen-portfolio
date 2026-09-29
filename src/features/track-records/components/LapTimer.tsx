/**
 * The panel's timing block: the personal best, and the lap replay counting up
 * to it.
 *
 * The personal best is what the section is named for, so it is the biggest
 * number in it, in plain white, and it never moves. React renders it straight
 * from `track.lap` — the string the list shows — so the two cannot disagree.
 * The replay clock is the secondary readout: a fraction of the size, in the
 * working cyan of the marker and the line it traces, with a car-dot glyph that
 * says which moving thing it belongs to. It counts the real lap time as the
 * marker drives it and reads exactly the personal best as it crosses the line.
 *
 * It used to be the other way round. A 44px stopwatch labelled "Lap time" led
 * the panel while the personal best only appeared at list size, so a visitor
 * read `0:08.044`, caught at a random moment of the on-screen lap, as the
 * record.
 *
 * A definition list, because that is what this is: two labelled values. Each
 * label precedes its value, so a screen reader hears "Personal best, 1:54.318"
 * rather than a bare number.
 *
 * Layout is a wrapping flex row aligned on *last* baselines. Where the panel
 * is wide enough the replay sits beside the personal best, on the same
 * baseline as its digits; where it is not, the replay drops beneath it, and
 * at the very narrowest (a 768px viewport, where the panel is narrower than on
 * a phone) its label and value wrap apart rather than overflow. No
 * breakpoint is involved, because the panel's width does not track the
 * viewport's.
 *
 * The replay's text is written by the animation loop, so the initial render
 * is a zeroed placeholder at the right width. That is also what reduced motion
 * shows — the marker parked on the line — beside a personal best that is
 * already on screen. Tabular figures are mandatory on the replay: without
 * them the block would shift on every frame.
 *
 * `aria-live="off"` is stated rather than left implicit. `role="timer"` already
 * implies it, but this text changes sixty times a second: if any assistive
 * technology treats the role as polite instead, it would read the replay
 * aloud on every frame. Not worth leaving to interpretation. The timer is
 * named by its visible label, like every UI label here in English.
 */

import { useId } from 'react';

import { cn } from '@/lib/cn';

import { LAP_NODE } from '../hooks/useLapAnimation';

/**
 * The mono tracking label, set on the `<dt>` itself rather than on a span
 * inside it: a span would leave the term's line box sized by the inherited
 * 16px, 7.5px taller than its own text.
 */
const TERM_CLASSES = 'tracking-mono-xl text-text-secondary font-mono text-[11px] uppercase';

export interface LapTimerProps {
  /** The personal best, `M:SS.mmm` — `track.lap`, exactly as the list shows it. */
  best: string;
  className?: string;
}

export function LapTimer({ best, className }: LapTimerProps) {
  const replayLabelId = useId();

  return (
    <dl
      className={cn(
        'flex flex-wrap items-baseline-last gap-x-8 gap-y-3.5 md:gap-x-10 md:gap-y-4',
        className,
      )}
    >
      <div>
        <dt lang="en" className={TERM_CLASSES}>
          Personal best
        </dt>
        <dd className="num text-text mt-2 text-[40px] leading-none font-medium whitespace-nowrap md:mt-2.5 md:text-[clamp(36px,4vw,56px)]">
          {best}
        </dd>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <dt id={replayLabelId} lang="en" className={TERM_CLASSES}>
          {/* The car dot in miniature: this clock belongs to the marker. */}
          <span
            aria-hidden="true"
            className="bg-accent-primary/25 mr-2 inline-grid size-[9px] place-items-center rounded-full align-middle"
          >
            <span className="bg-track-dot size-[3px] rounded-full" />
          </span>
          Lap replay
        </dt>
        <dd className="num text-accent-primary text-[16px] whitespace-nowrap md:text-[20px]">
          <span
            data-lap={LAP_NODE.chrono}
            role="timer"
            aria-live="off"
            aria-labelledby={replayLabelId}
          >
            0:00.000
          </span>
        </dd>
      </div>
    </dl>
  );
}
