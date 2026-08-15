/**
 * Runs a callback on every animation frame while `active` is true.
 *
 * The lap animation is driven from here rather than from CSS or a timer, so
 * that playback position stays frame-accurate and can be scrubbed.
 *
 * TODO: implement with requestAnimationFrame; cancel on unmount and whenever
 *       `active` flips to false.
 * TODO: keep the callback in a ref so a changing closure does not restart the
 *       loop.
 * TODO: clamp `delta` (e.g. to 100ms) so a backgrounded tab does not produce
 *       one enormous jump on return.
 */

/**
 * @param delta   Milliseconds since the previous frame.
 * @param elapsed Milliseconds since the loop started.
 */
export type RafCallback = (delta: number, elapsed: number) => void;

export function useRafLoop(_callback: RafCallback, _active: boolean = true): void {
  // Stub: no loop runs yet.
}
