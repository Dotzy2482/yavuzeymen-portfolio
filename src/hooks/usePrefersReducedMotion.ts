/**
 * Whether the visitor has asked the OS to reduce motion.
 *
 * This site is animation-heavy by design, which makes the opt-out mandatory
 * rather than optional. Every motion component must consult this hook and fall
 * back to a static, immediately-visible state.
 *
 * TODO: implement on top of useMediaQuery(REDUCED_MOTION_QUERY).
 */

export function usePrefersReducedMotion(): boolean {
  // Stub: assume motion is allowed until implemented.
  return false;
}
