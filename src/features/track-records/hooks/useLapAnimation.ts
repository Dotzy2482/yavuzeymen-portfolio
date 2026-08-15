/**
 * Drives the lap: advances playback progress each frame and derives the
 * displayed lap time from it.
 *
 * The key detail is the two clocks. Animation progress runs over
 * `track.displayDurationMs` (about 12 seconds), while the timer shows
 * `progress * track.lapTimeMs` — which may be eight real minutes. They share a
 * position but not a rate.
 *
 * TODO: implement on top of useRafLoop, advancing by
 *       delta / (displayDurationMs / speed) each frame and wrapping at 1.
 * TODO: expose progress as a MotionValue rather than a number so the marker
 *       can be animated without re-rendering React every frame.
 * TODO: honour prefers-reduced-motion — hold the marker at the start line and
 *       show the final lap time immediately.
 */

import type { SectorIndex, Track } from '../data/types';
import type { PlaybackSpeed } from './usePlayback';

export interface UseLapAnimationOptions {
  /** Null when no track is selected — the loop must not run. */
  track: Track | null;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  /** Called each frame with the new position, 0–1. */
  onProgress?: (progress: number) => void;
}

export interface UseLapAnimationResult {
  /** Position around the lap, 0–1. */
  progress: number;
  /** Elapsed *real* lap time in ms — progress × track.lapTimeMs. */
  elapsedLapMs: number;
  /** Which sector the car is currently in. */
  currentSector: SectorIndex;
  /** True on the frame the lap wraps past the start/finish line. */
  hasCompletedLap: boolean;
}

export function useLapAnimation(_options: UseLapAnimationOptions): UseLapAnimationResult {
  // Stub: car parked on the start/finish line.
  return {
    progress: 0,
    elapsedLapMs: 0,
    currentSector: 0,
    hasCompletedLap: false,
  };
}
