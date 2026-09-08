/** Barrel for the app-wide hooks. Feature-local hooks are not re-exported. */

export { useActiveSection } from './useActiveSection';

export { useInView } from './useInView';
export type { UseInViewOptions, UseInViewResult } from './useInView';

export { useMediaQuery } from './useMediaQuery';

export { useRafLoop } from './useRafLoop';
export type { RafCallback } from './useRafLoop';

export { usePrefersReducedMotion } from './usePrefersReducedMotion';
