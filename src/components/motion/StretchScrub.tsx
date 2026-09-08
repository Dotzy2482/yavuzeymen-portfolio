/**
 * Scrub-links Archivo's `wdth` variable axis to scroll position: the wrapped
 * heading enters condensed and widens to its display width as it travels up
 * the viewport.
 *
 * The argument for the device is that it is already paid for. `index.html`
 * requests `Archivo:wdth,wght@62..125,100..900`, so the continuous width axis
 * is on the page whether or not anything moves it — the site simply parks on
 * three points of it (`--stretch-ui`, `--stretch-wide`, `--stretch-display`).
 * Animating it costs zero new bytes and zero new dependencies.
 *
 * ## Why a custom property, not a style on the wrapper
 *
 * `font-variation-settings` inherits. Set on this wrapper it would also reach
 * `SectionHeading`'s mono index, meta label and lead paragraph — none of which
 * are Archivo. So the wrapper publishes a *variable* instead: `--axis-wdth` is
 * inert on an ancestor until something reads it, and exactly one element (the
 * one carrying `.stretch-scrub`) does.
 *
 * `font-variation-settings` also *overrides* `font-stretch` for the axes it
 * names, so `.stretch-scrub` and `.stretch-display` must never sit on the same
 * element. Swap the class, never stack it.
 *
 * ## Why the interpolation is in JS
 *
 * The token-native alternative is to keep the raw progress in the custom
 * property and interpolate in CSS —
 * `font-variation-settings: 'wdth' calc(88 + 37 * var(--axis-p))`. It is
 * tidier and fails gracefully, but `calc()` inside `font-variation-settings`
 * is exactly the sort of thing that works in three engines and not the fourth.
 * Not shipped.
 *
 * ## Why the value is quantised
 *
 * Changing `wdth` is a **reflow**, not a compositor-only property: advance
 * widths change, so the heading re-lays out and `SectionHeading`'s flex row
 * re-solves — that is what makes the hairline visibly shorten as the type
 * widens, which is the effect rather than a side-effect of it. Rounding to
 * integer axis units is visually indistinguishable at these sizes and collapses
 * a scroll's worth of distinct values into ~37, letting the browser skip the
 * style recalc on repeats.
 *
 * Two rules keep that reflow cheap: never stack a letter-spacing scrub on the
 * same element, and give any flex hairline beside the heading a `min-w-*` floor
 * so a short heading cannot crush it to zero and snap.
 *
 * ## Reduced motion
 *
 * Renders a plain `div` and never subscribes to scroll. With no wrapper
 * publishing a value, `--axis-wdth` falls back to `--axis-wdth-display` and the
 * type renders at 125 — which is exactly what the site looks like today. The
 * static state is the design, not a degraded version of it. And at every point
 * in the range the text is fully rendered and legible; the worst failure mode
 * is condensed type, never absent type.
 */

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionStyle,
  type UseScrollOptions,
} from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks';

/**
 * Defaults mirroring `--axis-wdth-entry` / `--axis-wdth-display` in
 * tokens.css. A JS interpolation cannot read a custom property without a
 * layout read, so the numbers are restated here; keep the two in step.
 *
 * 88, not the font's 62 floor: at 72px uppercase black, `wdth: 62` stops
 * reading as stretched Archivo and starts reading as a different typeface.
 * 88 → 125 is a ~30% swing, which is plenty.
 */
const AXIS_WDTH_ENTRY = 88;
const AXIS_WDTH_DISPLAY = 125;

/**
 * Condensed as the heading's top crosses the bottom of the viewport, full
 * width by the time it reaches the middle — half a viewport of travel, and
 * complete well before the heading leaves the screen.
 */
const DEFAULT_OFFSET = ['start end', 'start center'] as const;

export interface StretchScrubProps {
  children: React.ReactNode;
  /** `wdth` axis value at scroll progress 0. Default 88. */
  from?: number;
  /** `wdth` axis value at scroll progress 1. Default 125, the display width. */
  to?: number;
  /** `useScroll` offset through this wrapper. */
  offset?: NonNullable<UseScrollOptions['offset']>;
  className?: string;
}

/**
 * The scrolling half, split out so the reduced-motion branch is a different
 * component rather than a conditional hook.
 */
function ScrubbedAxis({
  children,
  from = AXIS_WDTH_ENTRY,
  to = AXIS_WDTH_DISPLAY,
  offset = [...DEFAULT_OFFSET],
  className,
}: StretchScrubProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const wdth = useTransform(scrollYProgress, (p) => Math.round(from + (to - from) * p));

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ '--axis-wdth': wdth } as MotionStyle}
      // No translate or scale utility belongs on this element or on the one
      // reading the axis: in Tailwind v4 those compile to the standalone
      // `translate`/`scale` properties, which compose with `transform` rather
      // than overriding it.
    >
      {children}
    </motion.div>
  );
}

export function StretchScrub(props: StretchScrubProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={props.className}>{props.children}</div>;
  }
  return <ScrubbedAxis {...props} />;
}
