/**
 * One row of the Setup equipment list: mono component label on the left, the
 * model on the right, and a cyan overlay on the row's hairline that fills as
 * the list scrolls past.
 *
 * ## The placeholder is a slot, not dim text
 *
 * All five values are still the handoff's `MODEL — YER TUTUCU`. Rendered as
 * 45%-white text it read as forgotten, because that is what dim grey text
 * means. The site already has a deliberate empty-slot language and uses it
 * twice — Partners' dashed "YOUR BRAND HERE" cells and Sim to Real's dashed
 * karting slot — and Setup was the third empty thing on the page and the only
 * one not speaking it. A dashed slot says "reserved" where dim text says
 * "unfinished", using an existing token and no new copy.
 *
 * No status word is invented for it, deliberately: the row labels are English
 * and the placeholder string is Turkish, so any new word would have to pick a
 * side. The slot says it without text. The placeholder string itself stays in
 * the DOM as `sr-only`, because for a screen reader it is still the only thing
 * distinguishing an unfilled row from a filled one — a dashed box is not
 * announced.
 *
 * The slot is one cap-height tall and sits on the text baseline, so it
 * occupies exactly the box the model name will occupy. Flipping a row's
 * `placeholder` to `false` in data/setup.ts swaps in the real value with no
 * layout shift, which is how ROADMAP plans to fill the list — one row at a
 * time.
 */

import { motion, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';
import type { SetupItem } from '@/data';

/**
 * Roughly the width a real model name occupies at these sizes ("FANATEC CSL
 * DD" and friends), so the dashed slot reserves the space rather than merely
 * marking it.
 */
const SLOT_WIDTH = 'w-[120px] md:w-[150px]';

export interface SpecRowProps {
  item: SetupItem;
  /** Scroll progress through the whole rows container, 0–1. */
  progress: MotionValue<number>;
  /** This row's position in the list, and the list's length. */
  index: number;
  count: number;
}

export function SpecRow({ item, progress, index, count }: SpecRowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // The row's own 0–1 window carved out of the container's progress: row i
  // fills between i/n and (i+1)/n. Career's sequential fill, rotated 90°.
  const scaleX = useTransform(progress, [index / count, (index + 1) / count], [0, 1]);

  return (
    <div className="border-hairline-mid relative flex items-baseline justify-between gap-5 border-b py-[18px] md:gap-8 md:py-6">
      <MonoLabel size="sm" tracking="chip" className="md:tracking-mono-lg md:text-[11px]">
        {item.label}
      </MonoLabel>
      <span className="tracking-caps stretch-ui text-right text-[13px] font-extrabold uppercase md:text-[16px]">
        {item.placeholder ? (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'border-border-dashed inline-block h-[0.72em] border border-dashed',
                SLOT_WIDTH,
              )}
            />
            <span className="sr-only">{item.value}</span>
          </>
        ) : (
          item.value
        )}
      </span>
      {/* Overlays the row's own `border-b`. `origin-left` is transform-origin
          and composes fine; a Tailwind `scale-x-*` or translate utility would
          not — in v4 those compile to standalone properties that stack with
          the motion-driven `transform` instead of being overridden by it. */}
      <motion.span
        aria-hidden="true"
        className="bg-accent-primary absolute inset-x-0 -bottom-px h-px origin-left"
        style={{ scaleX: prefersReducedMotion ? 1 : scaleX }}
      />
    </div>
  );
}
