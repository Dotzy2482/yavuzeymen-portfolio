/**
 * The detail panel for the selected circuit: the map, the timer, the sector
 * bars and the transport controls.
 *
 * TODO: wire usePlayback/useLapAnimation here and pass their output down.
 * TODO: implement the cross-fade when the selected track changes.
 * TODO: design the empty state — the panel can legitimately have no track when
 *       a filter matches nothing.
 */

import { cn } from '@/lib/cn';

import { TrackMap } from './TrackMap';
import { LapTimer } from './LapTimer';
import { SectorBar } from './SectorBar';
import { PlaybackControls } from './PlaybackControls';
import type { Track } from '../data/types';

export interface TrackPanelProps {
  /** Null when nothing is selected. */
  track: Track | null;
  className?: string;
}

export function TrackPanel({ track, className }: TrackPanelProps) {
  if (!track) {
    // TODO: proper empty state.
    return <div className={cn('track-panel', 'track-panel--empty', className)} />;
  }

  return (
    <div className={cn('track-panel', className)}>
      <TrackMap track={track} progress={0} />
      <LapTimer elapsedMs={0} totalMs={track.lapTimeMs} />
      <SectorBar sectors={track.sectors} progress={0} />
      <PlaybackControls
        isPlaying={false}
        progress={0}
        speed={1}
        onToggle={() => {}}
        onRestart={() => {}}
        onSeek={() => {}}
        onSpeedChange={() => {}}
      />
    </div>
  );
}
