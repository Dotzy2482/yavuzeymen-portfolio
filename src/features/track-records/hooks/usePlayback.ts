/**
 * Transport controls for the lap animation: play/pause, restart, scrub, speed.
 *
 * Deliberately separate from useLapAnimation. This hook owns *intent* (should
 * it be running, how fast, where did the user scrub to); useLapAnimation owns
 * the frame loop that acts on it. Keeping them apart means the controls can be
 * tested without a running rAF loop.
 *
 * TODO: implement with useState + useCallback.
 * TODO: pause automatically when the section scrolls out of view, and when the
 *       tab is hidden — no point burning frames nobody sees.
 * TODO: reset progress to 0 when the selected track changes.
 */

/** Playback rate multiplier applied to the track's displayDurationMs. */
export type PlaybackSpeed = 0.5 | 1 | 2;

export interface UsePlaybackResult {
  isPlaying: boolean;
  /** Current position in the lap, 0–1. */
  progress: number;
  speed: PlaybackSpeed;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  /** Jump to a position, 0–1. Used by the scrubber. */
  seek: (progress: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
}

export function usePlayback(): UsePlaybackResult {
  // Stub: paused at the start line.
  return {
    isPlaying: false,
    progress: 0,
    speed: 1,
    play: () => {},
    pause: () => {},
    toggle: () => {},
    restart: () => {},
    seek: () => {},
    setSpeed: () => {},
  };
}
