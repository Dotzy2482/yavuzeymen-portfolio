/**
 * Runs a callback on every animation frame while `active` is true.
 *
 * Per-frame DOM writes (hero helmet fit, lap animation) are driven from here
 * rather than from CSS or a timer, so positions stay frame-accurate and never
 * pass through React state.
 *
 * The callback lives in a ref so a changing closure does not restart the
 * loop, and `delta` is clamped to 100ms so a backgrounded tab does not
 * produce one enormous jump on return.
 */

import { useEffect, useRef } from 'react';

/**
 * @param delta   Milliseconds since the previous frame.
 * @param elapsed Milliseconds since the loop started.
 */
export type RafCallback = (delta: number, elapsed: number) => void;

export function useRafLoop(callback: RafCallback, active: boolean = true): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!active) return;

    let raf = 0;
    const start = performance.now();
    let last = start;

    const tick = (now: number) => {
      const delta = Math.min(100, now - last);
      last = now;
      callbackRef.current(delta, now - start);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
