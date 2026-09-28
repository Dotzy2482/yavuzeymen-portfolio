/**
 * Cross-cutting context providers.
 *
 * Currently only motion's <MotionConfig>. `reducedMotion="user"` makes every
 * motion component respect the OS setting by default — the safety net behind
 * the per-component usePrefersReducedMotion checks, not a replacement for
 * them.
 *
 * The error boundary is not here: App wraps this in ErrorBoundary, so a
 * provider that throws is caught too. There is deliberately no theme provider
 * either — the site is dark-only (docs/ROADMAP.md, "Explicitly not planned"),
 * and a provider for a single theme is dead weight.
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
