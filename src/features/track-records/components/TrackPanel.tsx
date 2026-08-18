/**
 * The right-hand panel: circuit name and meta, the chronometer, the map,
 * sector bars and transport controls.
 *
 * Ordering differs between breakpoints — desktop puts the chronometer beside
 * the name, mobile stacks it above — which is what the `order-*` classes are
 * doing.
 */

import { MonoLabel } from '@/components/ui';

import { LapTimer } from './LapTimer';
import { PlaybackControls } from './PlaybackControls';
import { SectorBar } from './SectorBar';
import { TrackMap } from './TrackMap';
import type { PlaybackSpeed } from '../hooks/usePlayback';
import type { Track } from '../data/types';

export interface TrackPanelProps {
  track: Track;
  driverName: string;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onToggle: () => void;
  onToggleSpeed: () => void;
}

export function TrackPanel({
  track,
  driverName,
  isPlaying,
  speed,
  onToggle,
  onToggleSpeed,
}: TrackPanelProps) {
  return (
    <div className="border-hairline bg-surface min-w-0 overflow-hidden border px-5 py-[22px] md:px-11 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-8">
        <LapTimer className="order-1 md:order-2" />
        <div className="order-2 min-w-0 md:order-1">
          <h3
            lang="en"
            className="tracking-caps stretch-display text-[22px] leading-[1.1] font-black uppercase md:text-[34px] md:leading-[1.05]"
          >
            {track.name}
          </h3>
          <MonoLabel size="sm" tracking="chip" as="div" className="mt-2 md:mt-3.5 md:text-[11px]">
            {track.length} · {track.corners} CORNERS · GT3 · IRACING
          </MonoLabel>
        </div>
      </div>

      <TrackMap path={track.path} trackName={track.name} driverName={driverName} />

      <div className="mt-[18px] flex flex-col gap-[18px] md:mt-7 md:flex-row md:items-center md:gap-7">
        <SectorBar />
        <PlaybackControls
          isPlaying={isPlaying}
          speed={speed}
          onToggle={onToggle}
          onToggleSpeed={onToggleSpeed}
        />
      </div>
    </div>
  );
}
