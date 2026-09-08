/**
 * A dashed "YOUR BRAND HERE" cell in the Partners grid.
 *
 * These two cells are the only actual *pitch* on the page, and were the
 * stillest thing in the section. The dashed outline is therefore drawn as an
 * inline `svg` `rect` rather than a CSS `border-dashed`, so its
 * `stroke-dashoffset` can be scrub-linked to the grid's scroll progress and
 * the dashes crawl around the cell as the section passes. It reads as track
 * marking, which is the vocabulary the rest of the page is already in.
 *
 * The rect is sized in percentages with no `viewBox`, so one SVG user unit is
 * one CSS pixel and the dash period is identical on the horizontal and
 * vertical edges. `vector-effect="non-scaling-stroke"` is belt and braces
 * against that ever stopping being true. The stroke straddles the cell edge,
 * hence `overflow-visible` — a hairline of bleed into a 12px grid gap.
 *
 * `stroke` is a presentation attribute, which any CSS rule outranks, so the
 * existing hover-to-cyan survives as a `group-hover:stroke-*` utility with the
 * same 250ms it had as a border colour.
 *
 * Under reduced motion the caller passes a null progress and never subscribes
 * to scroll; the offset pins to 0, a static dashed outline — exactly the cell
 * the site shipped before this.
 */

import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui';

/** Dash and gap, in CSS pixels. */
const DASH = 6;
const GAP = 6;
const DASH_PATTERN = `${DASH} ${GAP}`;
/**
 * How far the dashes travel over the grid's full scroll range, in pixels.
 * Eight whole dash periods — enough to read as movement, and a whole number of
 * periods so the pattern lands back in phase. Derived from the pattern rather
 * than written out, so re-tuning the dash cannot quietly break that.
 */
const CRAWL_DISTANCE = 8 * (DASH + GAP);

export interface OpenSlotProps {
  /**
   * Scroll progress through the partners grid, 0–1 — or `null` under reduced
   * motion, where the caller does not subscribe to scroll at all.
   */
  progress: MotionValue<number> | null;
  /** Shared grid-cell classes. */
  className?: string;
}

export function OpenSlot({ progress, className }: OpenSlotProps) {
  const pinned = useMotionValue(0);
  const dashOffset = useTransform(progress ?? pinned, [0, 1], [0, -CRAWL_DISTANCE]);

  return (
    <div className={cn('group relative cursor-default', className)}>
      {/* `h-full w-full` is not redundant beside `inset-0`. An `svg` is a
          replaced element, so `width: auto` resolves to its *intrinsic* size —
          the spec's 300x150 default, since this one carries no width/height
          attributes — rather than being stretched by the four insets the way a
          non-replaced box would be. Drop them and the overlay renders 300px
          wide inside a ~170px cell, which on a 375px viewport puts the whole
          page into horizontal scroll: measured scrollWidth 494 against a
          clientWidth of 375. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="var(--border-dashed)"
          strokeWidth={1}
          strokeDasharray={DASH_PATTERN}
          vectorEffect="non-scaling-stroke"
          className="group-hover:stroke-accent-primary transition-[stroke] duration-[250ms]"
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <MonoLabel
        size="xs"
        tracking="mono"
        tone="faint"
        lang="en"
        className="group-hover:text-accent-primary md:tracking-mono-xl transition-colors duration-[250ms] md:text-[11px]"
      >
        Your brand here
      </MonoLabel>
    </div>
  );
}
