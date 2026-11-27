/**
 * The hero's portrait layer: two photographs of the same frame stacked exactly,
 * with the helmeted one masked down to a soft circle — and never below the neck.
 *
 * There is no fitting maths here any more. Both photos are the same 1323×1189
 * crop of the same pose — bare-headed and helmeted — so giving them identical
 * boxes is the whole alignment story, and the top layer only needs masks. The
 * old build composited a separate helmet cut-out onto the head every frame and
 * paid for it in trigonometry that broke whenever the portrait moved.
 *
 * The heads line up; the bodies under them nearly do, which is not enough —
 * a circle edge crossing the collar showed it as a seam. So the helmet layer
 * is also held to a fixed region that stops at the neck line (helmetRegion.ts).
 *
 * Two modes:
 * - `static` (desktop): the cursor drives the reveal. The helmet is invisible
 *   until the cursor comes near the head, then opens under it.
 * - `scroll` (mobile): no cursor. The helmet starts on and comes off by
 *   itself a beat after it is on screen, irising shut onto the head while the
 *   portrait pushes in a little underneath. Scrolling the hero away drives
 *   the same reveal, and whichever of the two is further along wins.
 *
 * The mobile hero used to be pinned for 180vh and the reveal ran on that pin:
 * the page held still for most of a screen while the helmet came off, and on
 * a phone that read as the page being stuck. It now scrolls like any other
 * section from the first pixel.
 *
 * On desktop the reveal damps to nothing by how far the stage has left the
 * viewport.
 *
 * IMPORTANT: horizontal centring lives entirely in the inline `transform`.
 * Tailwind's `-translate-x-1/2` compiles to the standalone `translate` CSS
 * property, which *composes with* `transform` rather than being overridden by
 * it — using both shifts the element a full width instead of half.
 *
 * All writes are per-frame DOM mutations via useRafLoop — never React state.
 */

import { useRef, type CSSProperties } from 'react';
import type { MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { Picture } from '@/components/ui';
import { useRafLoop, usePrefersReducedMotion } from '@/hooks';

import { FACE_PHOTO, HELMET_PHOTO, HELMET_REVEAL, PORTRAIT_H, PORTRAIT_W } from './helmetReveal';
import { HELMET_REGION_MASK } from './helmetRegion';
import { useHelmetReveal } from './useHelmetReveal';

/** Base transform for both layers — see the centring note above. */
const CENTRED = 'translateX(-50%)';

/**
 * The static half of the helmet's mask: everything above the neck line. It is
 * drawn in the photo's own pixel space, so it is stretched to the image's box.
 */
const REGION_MASK: CSSProperties = {
  maskImage: HELMET_REGION_MASK,
  WebkitMaskImage: HELMET_REGION_MASK,
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
};

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Ease in and out, for the helmet coming off by itself. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export interface HeroPortraitProps {
  mode: 'static' | 'scroll';
  /** How far the hero has scrolled away (0–1) — required in scroll mode. */
  progress?: MotionValue<number>;
  /** The stage element, for coordinate space. */
  stageRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the stage is on screen; the loop stops while it is not. */
  visible: boolean;
}

export function HeroPortrait({ mode, progress, stageRef, visible }: HeroPortraitProps) {
  const faceRef = useRef<HTMLImageElement>(null);
  const helmetRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Time the helmet has been on screen, ms: the clock for it coming off by
  // itself. It only runs once the helmet photo has loaded, so a slow
  // connection never shows the face first and the helmet popping on after.
  const helmetShown = useRef(0);

  const reveal = useHelmetReveal({
    targetRef: helmetRef,
    mode: mode === 'scroll' ? 'scrub' : 'pointer',
    active: !prefersReducedMotion,
  });

  // Only while the stage is on screen: off it there is nothing to draw, and
  // the loop's layout reads were a forced style recalculation on every frame
  // of every other section.
  useRafLoop((delta) => {
    const face = faceRef.current;
    const helmet = helmetRef.current;
    const stage = stageRef.current;
    if (!face || !helmet || !stage) return;

    if (mode === 'scroll') {
      const helmetPhoto = helmet.querySelector('img');
      if (helmetPhoto?.complete) helmetShown.current += delta;
      const { autoDelay, autoDuration, scrubEnd } = HELMET_REVEAL;
      const byTime = easeInOut(clamp01((helmetShown.current - autoDelay) / autoDuration));
      const byScroll = clamp01((progress?.get() ?? 0) / scrubEnd);
      const off = Math.max(byTime, byScroll);
      // Both layers take the same transform, or the bodies stop lining up and
      // the circle shows a seam instead of a helmet.
      const transform = `${CENTRED} scale(${1 + off * 0.05})`;
      face.style.transform = transform;
      helmet.style.transform = transform;
      reveal(delta, () => 1 - off);
    } else {
      // Read lazily: with the cursor away from the hero and the helmet shut,
      // the reveal never asks, and the frame reads no layout at all.
      reveal(delta, () => {
        const rect = stage.getBoundingClientRect();
        return clamp01(1 + rect.top / (rect.height * HELMET_REVEAL.fadeViewport));
      });
    }
  }, !prefersReducedMotion && visible);

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
   *
   * A portrait-orientation tablet is `static` too, but 106vh of photo there is
   * wider than the screen and puts his forehead under the headline. There the
   * photo stands on the bottom edge instead, as on a phone, and is as tall as
   * the room under the headline allows: the headline starts at
   * `max(68px, 9vh)` and is one line of at most ~66px (see Hero), so
   * `91vh - 90px` leaves the crown about 24px clear of it.
   */
  const layer = cn(
    'absolute left-1/2 w-auto max-w-none origin-[50%_20%]',
    mode === 'scroll'
      ? 'bottom-0 h-[min(78vh,118vw)]'
      : 'top-[55px] h-[106vh] portrait:top-auto portrait:bottom-0 portrait:h-[calc(91vh_-_90px)]',
  );

  return (
    <div className="absolute inset-0">
      <Picture
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

        Two masks, one per element, and a pixel shows only where both let it
        through. The wrapper is the layer the loop drives — transform, opacity
        and the cursor circle, rewritten every frame. The photo inside carries
        the helmet region, which stops the reveal at the neck line and never
        changes. Nesting them rather than listing both on one element means the
        per-frame write only ever carries the circle; the region is set once,
        at render. The wrapper takes the photos' aspect ratio, so it is the
        same box as the face layer.

        Loaded at low priority so it never races the layer underneath it, which
        is the one that has to be on screen at first paint.
      */}
      <div
        ref={helmetRef}
        aria-hidden="true"
        style={{
          transform: CENTRED,
          aspectRatio: `${PORTRAIT_W} / ${PORTRAIT_H}`,
          // Gradients default to `repeat`, and a mask that tiles would put a
          // second circle on the frame.
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
        className={cn(layer, 'pointer-events-none z-[4] opacity-0 will-change-[opacity]')}
      >
        <Picture
          src={HELMET_PHOTO}
          alt=""
          width={PORTRAIT_W}
          height={PORTRAIT_H}
          fetchPriority="low"
          style={REGION_MASK}
          className="absolute inset-0 size-full max-w-none"
        />
      </div>
    </div>
  );
}
