/**
 * Subscribes to a CSS media query and re-renders when it changes.
 *
 * Used to drop expensive animations on small screens and to switch the
 * track-records layout between the two-column desktop and stacked mobile form.
 *
 * TODO: implement with window.matchMedia + useSyncExternalStore (avoids the
 *       SSR/hydration flash and gives a correct initial value).
 * TODO: pair with BREAKPOINTS from lib/constants.ts for named queries.
 */

export function useMediaQuery(_query: string): boolean {
  // Stub: desktop-first default until implemented.
  return false;
}
