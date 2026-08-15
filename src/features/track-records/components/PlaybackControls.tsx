/**
 * Transport bar for the lap animation: play/pause, restart, scrub and speed.
 *
 * Presentational only — every piece of state arrives as a prop from
 * usePlayback, so this component can be rendered in isolation.
 *
 * TODO: implement the scrubber (a range input, restyled).
 * TODO: implement the speed selector (0.5× / 1× / 2×).
 * TODO: add keyboard shortcuts — space to toggle, arrows to step frames.
 * TODO: give every control a visible label or an accessible name; icon-only
 *       buttons are not enough.
 */

import { cn } from '@/lib/cn';

import type { PlaybackSpeed } from '../hooks/usePlayback';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  /** Position around the lap, 0–1. */
  progress: number;
  speed: PlaybackSpeed;
  onToggle: () => void;
  onRestart: () => void;
  onSeek: (progress: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  className?: string;
}

export function PlaybackControls({
  isPlaying,
  progress,
  speed,
  onToggle,
  onRestart,
  onSeek,
  onSpeedChange,
  className,
}: PlaybackControlsProps) {
  // TODO: scrubber and speed selector are not built yet.
  void progress;
  void onSeek;
  void speed;
  void onSpeedChange;

  return (
    <div className={cn('playback-controls', className)}>
      <button type="button" onClick={onToggle} aria-pressed={isPlaying}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={onRestart}>
        Restart
      </button>
      {/* TODO: <input type="range" /> scrubber */}
      {/* TODO: speed selector */}
    </div>
  );
}
