/**
 * PAUSE/PLAY and 1X/2X — mono outline buttons that hover to cyan.
 *
 * Full-width and stacked on mobile so both stay comfortably tappable.
 */

import { cn } from '@/lib/cn';

import type { PlaybackSpeed } from '../hooks/usePlayback';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onToggle: () => void;
  onToggleSpeed: () => void;
  className?: string;
}

const BUTTON_CLASSES =
  'flex-1 cursor-pointer border border-border-btn bg-transparent px-0 py-[13px] font-mono text-[11px] tracking-chip text-text uppercase transition-colors duration-[250ms] hover:border-accent-primary hover:text-accent-primary md:flex-none md:px-[18px] md:py-2.5 md:text-[10px]';

export function PlaybackControls({
  isPlaying,
  speed,
  onToggle,
  onToggleSpeed,
  className,
}: PlaybackControlsProps) {
  return (
    <div className={cn('flex gap-2.5', className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={isPlaying ? 'Animasyonu duraklat' : 'Animasyonu oynat'}
        className={BUTTON_CLASSES}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        onClick={onToggleSpeed}
        aria-label={`Hız: ${speed}×. Değiştir.`}
        className={BUTTON_CLASSES}
      >
        {speed}X
      </button>
    </div>
  );
}
