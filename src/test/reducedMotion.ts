/**
 * Puts the test environment under `prefers-reduced-motion: reduce`.
 *
 * The matchMedia in setup.ts answers `false` to every query, which is the
 * motion-allowed default. Call this before rendering to answer `true` for the
 * reduced-motion query only, and `vi.unstubAllGlobals()` in an `afterEach` to
 * put the default back.
 */

import { vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@/lib/constants';

export function preferReducedMotion(): void {
  vi.stubGlobal('matchMedia', (query: string): MediaQueryList => ({
    matches: query === REDUCED_MOTION_QUERY,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}
