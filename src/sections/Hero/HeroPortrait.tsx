/**
 * The hero's portrait layer: two photographs of the same frame stacked exactly,
 * with the helmeted one masked down to a soft circle.
 *
 * There is no fitting maths here any more. Both photos are the same 1323×1189
 * crop of the same pose — bare-headed and helmeted — so giving them identical
 * boxes is the whole alignment story, and the top layer only needs a mask. The
 * old build composited a separate helmet cut-out onto the head every frame and
 * paid for it in trigonometry that broke whenever the portrait moved.
 *
 * Two modes:
 * - `static` (desktop): the cursor drives the reveal. The helmet is invisible
 *   until the cursor comes near the head, then opens under it.
 * - `scroll` (mobile): no cursor, so the pinned 180vh hero drives it instead —
 *   the helmet starts on and irises shut onto the head as the reader scrolls,
 *   while the portrait scales up underneath.
 *
 * The reveal damps to nothing as the hero leaves: by pin progress on mobile,
 * where the stage is pinned and its rect never moves, and by how far the stage
 * has left the viewport on desktop.
 *
 * IMPORTANT: horizontal centring lives entirely in the inline `transform`.
 * Tailwind's `-translate-x-1/2` compiles to the standalone `translate` CSS
 * property, which *composes with* `transform` rather than being overridden by
 * it — using both shifts the element a full width instead of half.
 *
 * All writes are per-frame DOM mutations via useRafLoop — never React state.
 */

import { useRef } from 'react';
import type { MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { useRafLoop, usePrefersReducedMotion } from '@/hooks';

import { FACE_PHOTO, HELMET_PHOTO, HELMET_REVEAL, PORTRAIT_H, PORTRAIT_W } from './helmetReveal';
import { useHelmetReveal } from './useHelmetReveal';

/** Base transform for both layers — see the centring note above. */
const CENTRED = 'translateX(-50%)';

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export interface HeroPortraitProps {
  mode: 'static' | 'scroll';
  /** Pin progress (0–1) — required in scroll mode. */
  progress?: MotionValue<number>;
  /** The stage element, for coordinate space. */
  stageRef: React.RefObject<HTMLDivElement | null>;
}

export function HeroPortrait({ mode, progress, stageRef }: HeroPortraitProps) {
  const faceRef = useRef<HTMLImageElement>(null);
  const helmetRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const reveal = useHelmetReveal({
    targetRef: helmetRef,
    mode: mode === 'scroll' ? 'scrub' : 'pointer',
    active: !prefersReducedMotion,
  });

  useRafLoop((delta) => {
    const face = faceRef.current;
    const helmet = helmetRef.current;
    const stage = stageRef.current;
    if (!face || !helmet || !stage) return;

    let amount: number;

    if (mode === 'scroll') {
      // Both layers take the same transform, or the bodies stop lining up and
      // the circle shows a seam instead of a helmet.
      const p = progress?.get() ?? 0;
      const transform = `${CENTRED} scale(${1 + p * 0.05})`;
      face.style.transform = transform;
      helmet.style.transform = transform;
      amount = clamp01(1 - p / HELMET_REVEAL.scrubEnd);
    } else {
      const rect = stage.getBoundingClientRect();
      amount = clamp01(1 + rect.top / (rect.height * HELMET_REVEAL.fadeViewport));
    }

    reveal(delta, amount);
  }, !prefersReducedMotion);

  /**
   * Both layers, so they cannot drift apart. `origin-[50%_20%]` puts the
   * scroll-scrub's scale centre on the head rather than the middle of the body.
   *
   * `max-w-none` overrides Tailwind's preflight `img { max-width: 100% }`.
   * Below `md` the portrait is deliberately wider than the viewport — the
   * `118vw` in the height clamp is what makes it so, and the stage crops the
   * overhang. Left to the preflight, the image is clamped to the viewport width
   * while keeping its height, which does not crop it: it squashes it, by 24% at
   * 390px wide.
   */
  const layer = cn(
    'absolute left-1/2 w-auto max-w-none origin-[50%_20%]',
    mode === 'scroll' ? 'bottom-0 h-[min(78vh,118vw)]' : 'top-[55px] h-[106vh]',
  );

  return (
    <div className="absolute inset-0">
      <img
        ref={faceRef}
        src={FACE_PHOTO}
        alt="Yavuz Eymen"
        width={PORTRAIT_W}
        height={PORTRAIT_H}
        style={{ transform: CENTRED }}
        className={cn(layer, 'z-[1]')}
      />

      {/*
        The helmet. Decorative — it is the same person in the same pose, so it
        adds nothing to the accessibility tree — and it renders shut, which is
        what makes reduced motion free: with no loop running nothing is ever
        written, and what stays on screen is the bare-headed portrait.

        Loaded at low priority so it never races the layer underneath it, which
        is the one that has to be on screen at first paint.
      */}
      <img
        ref={helmetRef}
        src={HELMET_PHOTO}
        alt=""
        aria-hidden="true"
        width={PORTRAIT_W}
        height={PORTRAIT_H}
        fetchPriority="low"
        style={{
          transform: CENTRED,
          // Gradients default to `repeat`, and a mask that tiles would put a
          // second circle on the frame.
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
        className={cn(layer, 'pointer-events-none z-[4] opacity-0 will-change-[opacity]')}
      />
    </div>
  );
}
