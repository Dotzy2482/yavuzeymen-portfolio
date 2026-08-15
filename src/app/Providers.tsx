/**
 * Cross-cutting context providers.
 *
 * Currently only motion's <MotionConfig>. `reducedMotion="user"` makes every
 * motion component respect the OS setting by default — the safety net behind
 * the per-component usePrefersReducedMotion checks, not a replacement for
 * them.
 *
 * TODO: add an error boundary.
 * TODO: add a theme provider only if a light theme is ever required. The site
 *       is dark-only today and a provider for a single theme is dead weight.
 */

import { MotionConfig } from 'motion/react';

import { DURATION, EASE_OUT } from '@/lib/constants';

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: DURATION.base, ease: [...EASE_OUT] }}
    >
      {children}
    </MotionConfig>
  );
}
