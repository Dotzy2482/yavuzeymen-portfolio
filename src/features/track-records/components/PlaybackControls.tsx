/**
 * PAUSE/PLAY and 1X/2X — mono outline buttons that hover to cyan.
 *
 * Full-width and stacked on mobile so both stay comfortably tappable.
 *
 * Each button is named by the words it shows, in English like every UI label
 * here. A Turkish aria-label used to replace them ("Animasyonu duraklat" on a
 * button reading PAUSE), which fails WCAG 2.5.3 Label in Name: a voice-control
 * user saying what they see — "click Pause" — hit nothing. The speed button
 * adds an sr-only "Speed" so "1X" is not announced bare.
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
  'flex-1 cursor-pointer border border-border-btn bg-transparent px-0 py-[13px] font-mono text-[11px] tracking-chip text-text uppercase transition-colors duration-base hover:border-accent-primary hover:text-accent-primary md:flex-none md:px-[18px] md:py-2.5 md:text-[10px]';

export function PlaybackControls({
  isPlaying,
  speed,
  onToggle,
  onToggleSpeed,
  className,
}: PlaybackControlsProps) {
  return (
    <div className={cn('flex gap-2.5', className)}>
      <button type="button" onClick={onToggle} lang="en" className={BUTTON_CLASSES}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={onToggleSpeed} lang="en" className={BUTTON_CLASSES}>
        <span className="sr-only">Speed</span> {speed}X
      </button>
    </div>
  );
}
