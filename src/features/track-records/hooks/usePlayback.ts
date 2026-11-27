/**
 * Transport controls for the lap animation: play/pause and speed.
 *
 * Deliberately separate from useLapAnimation. This hook owns *intent* (should
 * it be running, how fast); useLapAnimation owns the frame loop that acts on
 * it. Keeping them apart means the controls can be tested without a running
 * rAF loop.
 *
 * The lap plays on its own, under prefers-reduced-motion too. It used to
 * start paused there, and Windows' "Animation effects" switch (off on plenty
 * of machines whose owners never chose it) sets that preference, so on those
 * computers the replay sat at 0:00.000 and read as broken. The replay is the
 * section's content rather than decoration, it moves a small marker along a
 * line, and Pause is one press away.
 */

import { useCallback, useState } from 'react';

/** Playback rate multiplier applied to the on-screen lap duration. */
export type PlaybackSpeed = 1 | 2;

export interface UsePlaybackResult {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  toggle: () => void;
  toggleSpeed: () => void;
}

export function usePlayback(): UsePlaybackResult {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const toggle = useCallback(() => setIsPlaying((playing) => !playing), []);
  const toggleSpeed = useCallback(() => setSpeed((s) => (s === 1 ? 2 : 1)), []);

  return { isPlaying, speed, toggle, toggleSpeed };
}
