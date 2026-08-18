/**
 * Subscribes to a CSS media query and re-renders when it changes.
 *
 * Used to drop expensive animations on small screens and to switch layouts
 * between the desktop and mobile variants (hero, track records, content fan).
 *
 * Built on useSyncExternalStore so the initial client render already has the
 * correct value and there is no hydration flash.
 */

import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    // Server snapshot: mobile-first default. Irrelevant today (no SSR) but
    // keeps the hook correct if the site ever pre-renders.
    () => false,
  );
}
