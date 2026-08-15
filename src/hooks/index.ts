/** Barrel for the app-wide hooks. Feature-local hooks are not re-exported. */

export { useInView } from './useInView';
export type { UseInViewOptions, UseInViewResult } from './useInView';

export { useMediaQuery } from './useMediaQuery';

export { useRafLoop } from './useRafLoop';
export type { RafCallback } from './useRafLoop';

export { useScrollProgress } from './useScrollProgress';
export type { UseScrollProgressOptions } from './useScrollProgress';

export { usePrefersReducedMotion } from './usePrefersReducedMotion';
