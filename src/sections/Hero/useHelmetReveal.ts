/**
 * The hero's helmet reveal: a soft-edged circle that follows the cursor and
 * opens as it nears Yavuz's head, showing the helmeted photograph through the
 * bare-headed one underneath.
 *
 * One layer, one moving mask. The two photos are the same crop, so nothing has
 * to be fitted or aligned per frame — the entire effect is a radial-gradient
 * mask whose centre, radius and softness this hook rewrites. It goes on the
 * wrapper around the helmeted photo; the photo inside carries a second, fixed
 * mask that stops the reveal at the neck line (`helmetRegion.ts`), so however
 * large this circle grows, it can only ever uncover the helmet.
 *
 * Two modes:
 * - `pointer` — desktop. The circle chases the cursor and its radius grows from
 *   `radius.min` to `radius.max` as the cursor closes on the head. Past `far`
 *   the layer is gone entirely.
 * - `scrub` — below `md`, where there is no cursor. The caller drives the
 *   opening from the pinned hero's scroll progress and the circle stays on the
 *   head, starting wide enough to cover the frame and irising shut.
 *
 * Like the lap animation, this hook owns no loop of its own. It returns an
 * `update(delta, amount)` that the host calls from the rAF loop it already runs,
 * so nothing here ever touches React state — re-rendering the hero sixty times a
 * second to move a gradient is not an option.
 *
 * Cost control: once the circle has closed, the update writes the resting state
 * once and then returns early. A visitor whose cursor never goes near the head
 * pays for a distance check per frame and nothing else.
 */

import { useEffect, useRef, type RefObject } from 'react';

import { HELMET_REVEAL } from './helmetReveal';

/** Below this the circle is close enough to shut to skip the write entirely. */
const OPEN_EPSILON = 0.002;

/**
 * The soft edge, as (position, alpha) pairs across the falloff — 0 is where the
 * opaque core ends, 1 is the outer rim. Hand-shaped rather than linear: a
 * straight ramp reads as a visible cone, these read as an out-of-focus edge.
 */
const FALLOFF: readonly (readonly [number, number])[] = [
  [0, 1],
  [0.28, 0.92],
  [0.52, 0.66],
  [0.72, 0.36],
  [0.88, 0.13],
  [1, 0],
];

interface PointerState {
  x: number;
  y: number;
  /** False until the first move, and again once the pointer leaves the page. */
  inside: boolean;
}

interface RevealState {
  x: number;
  y: number;
  open: number;
  /** False until the first frame has seeded x/y, which must not lerp from 0,0. */
  seeded: boolean;
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** The spotlight as a mask gradient: opaque to `core`, then the soft falloff. */
function softCircle(x: number, y: number, radius: number, core: number): string {
  const stops = FALLOFF.map(([t, alpha]) => {
    const position = (core + (1 - core) * t) * 100;
    return `rgba(0,0,0,${alpha}) ${position.toFixed(2)}%`;
  });
  return `radial-gradient(circle ${radius.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(0,0,0,1) 0%, ${stops.join(', ')})`;
}

function setMask(el: HTMLElement, value: string): void {
  // setProperty for both spellings: the prefixed one is not in the typed
  // CSSStyleDeclaration, and going through the same call for both keeps them
  // impossible to set out of step.
  el.style.setProperty('mask-image', value);
  el.style.setProperty('-webkit-mask-image', value);
}

export interface UseHelmetRevealOptions {
  /** The masked layer — the wrapper around the helmeted photo, in its box. */
  targetRef: RefObject<HTMLElement | null>;
  /** Where the opening comes from. See the mode notes above. */
  mode: 'pointer' | 'scrub';
  /** Off under reduced motion: no listener, no writes, layer stays at rest. */
  active: boolean;
}

/**
 * @returns `update(delta, amount)` — call once per frame.
 *   `delta` is milliseconds since the previous frame, for the smoothing.
 *   `amount` means what the mode says it means: in `pointer` mode it damps the
 *   cursor-driven reveal from 1 (full) to 0 (off) so the effect can fade out as
 *   the hero scrolls away; in `scrub` mode it *is* the opening, 1 being the
 *   helmet fully on.
 */
export function useHelmetReveal({
  targetRef,
  mode,
  active,
}: UseHelmetRevealOptions): (delta: number, amount: number) => void {
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false });
  const state = useRef<RevealState>({ x: 0, y: 0, open: 0, seeded: false });
  const resting = useRef(false);

  const tracking = active && mode === 'pointer';

  useEffect(() => {
    if (!tracking) return;

    const move = (event: PointerEvent) => {
      // Touch and pen fire pointermove too, and a tap that reveals the helmet
      // under a fingertip the finger is covering is not worth the layer.
      if (event.pointerType !== 'mouse') return;
      pointer.current = { x: event.clientX, y: event.clientY, inside: true };
    };
    const leave = () => {
      pointer.current.inside = false;
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
    };
  }, [tracking]);

  return (delta: number, amount: number) => {
    const el = targetRef.current;
    if (!el) return;

    // The mask lives in the layer's own untransformed box, so measure that and
    // not the rect — the rect carries the scroll-scrub's scale.
    const boxW = el.offsetWidth;
    const boxH = el.offsetHeight;
    if (!boxW || !boxH) return;

    const { head, radius, core, near, far, followTau, openTau, scrubRadius } = HELMET_REVEAL;
    const headX = head.x * boxW;
    const headY = head.y * boxH;

    let targetX = headX;
    let targetY = headY;
    let targetOpen = amount;

    if (mode === 'pointer') {
      const p = pointer.current;
      if (!p.inside) {
        targetOpen = 0;
      } else {
        const rect = el.getBoundingClientRect();
        const scale = rect.width / boxW || 1;
        targetX = (p.x - rect.left) / scale;
        targetY = (p.y - rect.top) / scale;
        const distance = Math.hypot(targetX - headX, targetY - headY) / boxH;
        targetOpen = clamp01((far - distance) / (far - near)) * amount;
      }
    }

    const s = state.current;
    if (!s.seeded) {
      s.seeded = true;
      s.x = targetX;
      s.y = targetY;
    }

    // Exponential smoothing on the frame's own delta, so the feel of the trail
    // does not change with the refresh rate.
    const kFollow = 1 - Math.exp(-delta / followTau);
    const kOpen = 1 - Math.exp(-delta / openTau);
    s.x += (targetX - s.x) * kFollow;
    s.y += (targetY - s.y) * kFollow;
    s.open += (targetOpen - s.open) * kOpen;

    if (s.open <= OPEN_EPSILON) {
      // Shut: drop the mask so the layer is not compositing a gradient nobody
      // can see, then stop writing until it opens again.
      if (!resting.current) {
        resting.current = true;
        s.open = 0;
        el.style.opacity = '0';
        setMask(el, 'none');
      }
      return;
    }
    resting.current = false;

    const r =
      mode === 'pointer'
        ? boxH * (radius.min + (radius.max - radius.min) * s.open)
        : boxH * scrubRadius * s.open;

    setMask(el, softCircle(s.x, s.y, r, core));
    // Only the cursor needs the opacity ramp, because its circle bottoms out at
    // `radius.min` rather than at nothing — without it a helmet the size of a
    // coin would pop on at the edge of range. The scrub's radius really does go
    // to zero, so leaving it at full opacity keeps the iris an iris instead of
    // turning it into a cross-fade with a ghost helmet in the middle.
    el.style.opacity = mode === 'pointer' ? String(Math.min(1, s.open * 1.35)) : '1';
  };
}
