/**
 * The right-hand panel: circuit name and meta, the timing block (personal
 * best and lap replay), the map, sector bars and transport controls.
 *
 * The header is a column at every width. Desktop reads name, then timing; a
 * phone leads with the timing block, as the design does — that is what the
 * `order-*` classes are doing. The name comes first in the DOM either way, so
 * a screen reader landing on the circuit's heading hears its personal best
 * after it rather than having passed it.
 *
 * The desktop header used to be a wrapping row, the name beside the clock.
 * Whenever a name was too long to share the row — Nürburgring GP at 1440, for
 * one — the clock dropped onto a line of its own, so the panel's height
 * depended on which circuit was picked. As a column it is one height for all
 * twelve.
 *
 * Every label that carries meaning is at least 11px on both viewports. The
 * OpenStreetMap credit is 10px: small print, but it has to stay legible — it
 * is a licence obligation, not decoration.
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
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="order-2 min-w-0 md:order-1">
          <h3
            lang="en"
            className="tracking-caps stretch-display text-[22px] leading-[1.1] font-black uppercase md:text-[34px] md:leading-[1.05]"
          >
            {track.name}
          </h3>
          {/* At 11px the line no longer fits a phone, so it breaks on purpose,
              between the circuit and the car, instead of wherever it runs out
              and leaving a separator hanging at the end of the line. */}
          <MonoLabel size="md" tracking="chip" as="div" className="mt-2 md:mt-3.5">
            {track.length} · {track.corners} CORNERS
            <span className="hidden md:inline"> · </span>
            <span className="block md:inline">GT3 · IRACING</span>
          </MonoLabel>
        </div>
        <LapTimer best={track.lap} className="order-1 md:order-2" />
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

      {/* The outlines are drawn from OpenStreetMap data, which is ODbL: a map
          derived from it must credit it wherever the map is shown. */}
      <MonoLabel as="div" size="sm" tone="faint" tracking="chip" lang="en" className="mt-5 md:mt-6">
        Circuit maps ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text underline underline-offset-2 transition-colors"
        >
          OpenStreetMap
        </a>{' '}
        contributors
      </MonoLabel>
    </div>
  );
}
