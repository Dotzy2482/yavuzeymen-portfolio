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
 * - `hover` (desktop): helmet is ON by default and fades away under the
 *   cursor (lerp 0.085, scale 0.955→1).
 * - `scroll` (mobile): the pinned 180vh hero scrubs the helmet up/away —
 *   translate, rotate −6°, scale +0.95, fade, blur.
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

/** Cutout portrait source dimensions and helmet-fit constants. */
const PORTRAIT_W = 1323;
const PORTRAIT_H = 1189;
const EYE_Y = 205;
const SHELL_W = 470;
const SHELL_FRACTION = 0.97;
const VISOR_CENTER = 0.47;
const HELMET_ASPECT = 508 / 492;
const HOVER_LERP = 0.085;

export interface HeroPortraitProps {
  mode: 'hover' | 'scroll';
  /** Pin progress (0–1) — required in scroll mode. */
  progress?: MotionValue<number>;
  /** The stage element, for coordinate space. */
  stageRef: React.RefObject<HTMLDivElement | null>;
}

export function HeroPortrait({ mode, progress, stageRef }: HeroPortraitProps) {
  const portraitRef = useRef<HTMLImageElement>(null);
  const helmetRef = useRef<HTMLDivElement>(null);
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const hoverValue = useRef(1);
  const prefersReducedMotion = usePrefersReducedMotion();

  /** Sizes and positions the helmet over the head. Returns the pin progress. */
  const fit = useCallback((): number => {
    const portrait = portraitRef.current;
    const helmet = helmetRef.current;
    const stage = stageRef.current;
    if (!portrait || !helmet || !stage) return 0;

    const p = progress?.get() ?? 0;
    const stageRect = stage.getBoundingClientRect();
    const portraitRect = portrait.getBoundingClientRect();
    // Recover the unscaled height: the rect includes any scale we applied.
    const scale = portraitRect.height / PORTRAIT_H / (1 + p * (mode === 'scroll' ? 0.05 : 0.06));
    const baseHeight = PORTRAIT_H * scale;
    const eyeY =
      mode === 'scroll'
        ? stageRect.height - baseHeight + EYE_Y * scale
        : portraitRect.top - stageRect.top + EYE_Y * scale;
    const helmetWidth = (SHELL_W * scale) / SHELL_FRACTION;

    helmet.style.width = `${helmetWidth}px`;
    helmet.style.top = `${eyeY - VISOR_CENTER * helmetWidth * HELMET_ASPECT}px`;
    return p;
  }, [mode, progress, stageRef]);

  useRafLoop(() => {
    const portrait = portraitRef.current;
    const helmet = helmetRef.current;
    const stage = stageRef.current;
    if (!portrait || !helmet || !stage) return;

    const p = fit();

    if (mode === 'scroll') {
      // Scrubbed reveal — mirror of the mobile prototype.
      const vh = stage.getBoundingClientRect().height / 100;
      helmet.style.transform = `translate(-50%, ${p * 3 * vh}px) rotate(${-p * 6}deg) scale(${1 + p * 0.95})`;
      helmet.style.opacity = String(Math.max(0, 1 - p * 1.45));
      helmet.style.filter = `blur(${p * 8}px)`;
      portrait.style.transform = `translateX(-50%) scale(${1 + p * 0.05})`;
      return;
    }

    // Hover fade — helmet is on by default, disappears under the cursor.
    let target = 1;
    const m = mouse.current;
    if (m) {
      const r = helmet.getBoundingClientRect();
      if (m.x > r.left - 10 && m.x < r.right + 10 && m.y > r.top - 10 && m.y < r.bottom + 10) {
        target = 0;
      }
    }
    hoverValue.current += (target - hoverValue.current) * HOVER_LERP;
    const hv = hoverValue.current;
    helmet.style.opacity = String(Math.max(0, hv));
    helmet.style.transform = `translate(-50%, 0) scale(${0.955 + 0.045 * hv})`;
  }, !prefersReducedMotion);

  // Reduced motion: no loop, but the helmet still has to sit on the head —
  // fit once, then only on resize or when the portrait finishes decoding.
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
    <div
      onMouseMove={
        mode === 'hover' ? (e) => (mouse.current = { x: e.clientX, y: e.clientY }) : undefined
      }
      onMouseLeave={mode === 'hover' ? () => (mouse.current = null) : undefined}
      className="absolute inset-0"
    >
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
        <img src="/images/hero/helmet.png" alt="" className="block h-auto w-full" />
      </div>
    </div>
  );
}
