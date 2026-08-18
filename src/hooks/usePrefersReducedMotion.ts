/**
 * Whether the visitor has asked the OS to reduce motion.
 *
 * This site is animation-heavy by design, which makes the opt-out mandatory
 * rather than optional. Every motion component must consult this hook and fall
 * back to a static, immediately-visible state.
 */

import { REDUCED_MOTION_QUERY } from '@/lib/constants';

import { useMediaQuery } from './useMediaQuery';

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
