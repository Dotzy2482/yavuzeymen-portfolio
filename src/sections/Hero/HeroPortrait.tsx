/**
 * The hero's portrait + helmet layer, with the helmet fitted onto the head
 * every frame.
 *
 * Fitting math (from the prototype, robust to portrait offset/size): the
 * cutout portrait is 1323×1189 with the eyes at source y≈205; the helmet
 * shell is ~470 source px wide and occupies 97% of the PNG's width, with the
 * visor centre at 47% of the PNG's height (508/492 aspect correction).
 *
 * Two modes:
 * - `static` (desktop): the helmet is simply on. It used to fade away under the
 *   cursor; that is gone, replaced by the scan reveal below.
 * - `scroll` (mobile): the pinned 180vh hero scrubs the helmet up/away —
 *   translate, rotate −6°, scale +0.95, fade, blur.
 *
 * On top of either mode, `useHelmetScan` sweeps a diagonal band across the
 * helmet that swaps the photo for its wireframe inside the band. It runs off
 * this component's rAF loop rather than one of its own, so the fit and all
 * three scan layers advance on the same frame. The scan damps to nothing as the
 * hero scrolls away — by pin progress on mobile, where the stage is pinned and
 * its rect never moves, and by how far the stage has left the viewport on
 * desktop.
 *
 * IMPORTANT: horizontal centring lives entirely in the inline `transform`.
 * Tailwind's `-translate-x-1/2` compiles to the standalone `translate` CSS
 * property, which *composes with* `transform` rather than being overridden by
 * it — using both shifts the element a full width instead of half.
 *
 * All writes are per-frame DOM mutations via useRafLoop — never React state.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';

import { cn } from '@/lib/cn';
import { useRafLoop, usePrefersReducedMotion } from '@/hooks';

import { HelmetScanReveal } from './HelmetScanReveal';
import { HELMET_SCAN } from './helmetScan';
import { useHelmetScan } from './useHelmetScan';

/** Cutout portrait source dimensions and helmet-fit constants. */
const PORTRAIT_W = 1323;
const PORTRAIT_H = 1189;
const EYE_Y = 205;
const SHELL_W = 470;
const SHELL_FRACTION = 0.97;
const VISOR_CENTER = 0.47;
const HELMET_ASPECT = 508 / 492;

/** Pin progress at which the scan has fully faded — well before the helmet has. */
const SCAN_FADE_PROGRESS = 0.45;
/** Fraction of the stage that may scroll off the top before the scan is gone. */
const SCAN_FADE_VIEWPORT = 0.5;

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
  const portraitRef = useRef<HTMLImageElement>(null);
  const helmetRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // The helmet wrapper is also the scan's container: the three layers are its
  // children, so the sweep finds them without a second ref or a wrapper div.
  const scan = useHelmetScan({
    containerRef: helmetRef,
    bandWidth: mode === 'scroll' ? HELMET_SCAN.bandWidthMobile : HELMET_SCAN.bandWidth,
    angle: HELMET_SCAN.angle,
    sweepDuration: HELMET_SCAN.sweepDuration,
    idleInterval: HELMET_SCAN.idleInterval,
  });

  /**
   * Sizes and positions the helmet over the head.
   *
   * @returns the pin progress, and how much of the scan effect should survive
   *   at this scroll position.
   */
  const fit = useCallback((): { p: number; damp: number } => {
    const portrait = portraitRef.current;
    const helmet = helmetRef.current;
    const stage = stageRef.current;
    if (!portrait || !helmet || !stage) return { p: 0, damp: 0 };

    const p = progress?.get() ?? 0;
    const stageRect = stage.getBoundingClientRect();
    const portraitRect = portrait.getBoundingClientRect();
    // Recover the unscaled height: the rect includes any scale we applied.
    // Only scroll mode ever scales the portrait, and only scroll mode has a
    // non-zero p, so the correction is a no-op on desktop.
    const scale = portraitRect.height / PORTRAIT_H / (1 + p * 0.05);
    const baseHeight = PORTRAIT_H * scale;
    const eyeY =
      mode === 'scroll'
        ? stageRect.height - baseHeight + EYE_Y * scale
        : portraitRect.top - stageRect.top + EYE_Y * scale;
    const helmetWidth = (SHELL_W * scale) / SHELL_FRACTION;

    helmet.style.width = `${helmetWidth}px`;
    helmet.style.top = `${eyeY - VISOR_CENTER * helmetWidth * HELMET_ASPECT}px`;

    const damp =
      mode === 'scroll'
        ? clamp01(1 - p / SCAN_FADE_PROGRESS)
        : clamp01(1 + stageRect.top / (stageRect.height * SCAN_FADE_VIEWPORT));

    return { p, damp };
  }, [mode, progress, stageRef]);

  useRafLoop((_delta, elapsed) => {
    const portrait = portraitRef.current;
    const helmet = helmetRef.current;
    const stage = stageRef.current;
    if (!portrait || !helmet || !stage) return;

    const { p, damp } = fit();

    if (mode === 'scroll') {
      // Scrubbed reveal — mirror of the mobile prototype.
      const vh = stage.getBoundingClientRect().height / 100;
      helmet.style.transform = `translate(-50%, ${p * 3 * vh}px) rotate(${-p * 6}deg) scale(${1 + p * 0.95})`;
      helmet.style.opacity = String(Math.max(0, 1 - p * 1.45));
      helmet.style.filter = `blur(${p * 8}px)`;
      portrait.style.transform = `translateX(-50%) scale(${1 + p * 0.05})`;
    } else {
      // Desktop: the helmet just sits there. The scan reveal is the only thing
      // that happens to it.
      helmet.style.opacity = '1';
      helmet.style.transform = 'translate(-50%, 0)';
    }

    scan(elapsed, damp);
  }, !prefersReducedMotion);

  // Reduced motion: no loop, but the helmet still has to sit on the head —
  // fit once, then only on resize or when the portrait finishes decoding. The
  // scan layers render at rest, so nothing has to switch them off.
  useEffect(() => {
    if (!prefersReducedMotion) return;
    const run = () => {
      fit();
      const helmet = helmetRef.current;
      if (helmet) {
        helmet.style.opacity = '1';
        helmet.style.transform = 'translate(-50%, 0)';
      }
    };
    run();
    const observer = new ResizeObserver(run);
    const stage = stageRef.current;
    if (stage) observer.observe(stage);
    const portrait = portraitRef.current;
    portrait?.addEventListener('load', run);
    return () => {
      observer.disconnect();
      portrait?.removeEventListener('load', run);
    };
  }, [prefersReducedMotion, fit, stageRef]);

  return (
    <div className="absolute inset-0">
      <img
        ref={portraitRef}
        src="/images/hero/portrait-cutout.png"
        alt="Yavuz Eymen"
        width={PORTRAIT_W}
        height={PORTRAIT_H}
        style={{ transform: 'translateX(-50%)' }}
        className={cn(
          'absolute left-1/2 z-[1] w-auto origin-[50%_20%]',
          mode === 'scroll' ? 'bottom-0 h-[min(78vh,118vw)]' : 'top-[55px] h-[106vh]',
        )}
      />
      <div
        ref={helmetRef}
        style={{ transform: 'translate(-50%, 0)' }}
        className="pointer-events-none absolute left-1/2 z-[4] opacity-0 will-change-[transform,opacity,filter]"
      >
        <HelmetScanReveal />
      </div>
    </div>
  );
}
