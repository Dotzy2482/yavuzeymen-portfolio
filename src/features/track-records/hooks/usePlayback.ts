/**
 * Transport controls for the lap animation: play/pause and speed.
 *
 * Deliberately separate from useLapAnimation. This hook owns *intent* (should
 * it be running, how fast); useLapAnimation owns the frame loop that acts on
 * it. Keeping them apart means the controls can be tested without a running
 * rAF loop.
 *
 * Under prefers-reduced-motion playback starts paused: the design auto-plays,
 * but "reduce motion" means nothing moves until the visitor asks for it. The
 * same holds if the setting is switched on mid-visit — a running lap stops
 * where it is. Switching it off does not restart anything; that is the
 * visitor's call, and Play is right there.
 */

import { useCallback, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks';

/** Playback rate multiplier applied to the on-screen lap duration. */
export type PlaybackSpeed = 1 | 2;

export interface UsePlaybackResult {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  toggle: () => void;
  toggleSpeed: () => void;
}

export function usePlayback(): UsePlaybackResult {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  // Adjusting state during render, React's pattern for reacting to a changed
  // input without an effect: the pause lands in the same commit as the change.
  const [reducedMotionSeen, setReducedMotionSeen] = useState(prefersReducedMotion);
  if (prefersReducedMotion !== reducedMotionSeen) {
    setReducedMotionSeen(prefersReducedMotion);
    if (prefersReducedMotion) setIsPlaying(false);
  }

  const toggle = useCallback(() => setIsPlaying((playing) => !playing), []);
  const toggleSpeed = useCallback(() => setSpeed((s) => (s === 1 ? 2 : 1)), []);

  return { isPlaying, speed, toggle, toggleSpeed };
}
