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
 * Under reduced motion the offset is a fixed 0 — a static dashed outline,
 * i.e. exactly today's cell.
 */

import { motion, useTransform, type MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { MonoLabel } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';

/** Dash and gap, in CSS pixels. */
const DASH_PATTERN = '6 6';
/**
 * How far the dashes travel over the grid's full scroll range, in pixels.
 * Eight whole dash periods — enough to read as movement, and a whole number of
 * periods so the pattern lands back in phase.
 */
const CRAWL_DISTANCE = 8 * 12;

export interface OpenSlotProps {
  /** Scroll progress through the partners grid, 0–1. */
  progress: MotionValue<number>;
  /** Shared grid-cell classes. */
  className?: string;
}

export function OpenSlot({ progress, className }: OpenSlotProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dashOffset = useTransform(progress, [0, 1], [0, -CRAWL_DISTANCE]);

  return (
    <div className={cn('group relative cursor-default', className)}>
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
          style={{ strokeDashoffset: prefersReducedMotion ? 0 : dashOffset }}
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
