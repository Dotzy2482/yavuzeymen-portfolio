/**
 * The track-records module's single entry point: region filter, the track
 * picker and the animated panel.
 *
 * One rAF loop drives the whole lap, finding its targets under this
 * component's container ref. That same element is what visibility is measured
 * against, so frames are only spent while the panel itself is on screen —
 * not from the moment the section heading appears.
 *
 * The region filter is a plain button group, not an ARIA tab widget: a real
 * tablist owes the user `tabpanel` semantics and arrow-key roving focus, and
 * a half-implemented one promises a structure that is not there.
 * `aria-current` conveys the selection honestly.
 *
 * The driver plate is uppercased with the Turkish locale, not `toUpperCase()`.
 * The plain method is locale-independent and maps `i` to `I`; in a `lang="tr"`
 * document, where CSS `text-transform` would produce `İ`, that is the same trap
 * the English UI labels dodge with `lang="en"` — just on the JavaScript side.
 */

import { cn } from '@/lib/cn';
import { useInView } from '@/hooks';
import { profile } from '@/data';

import { TrackList } from './TrackList';
import { TrackPanel } from './TrackPanel';
import { useLapAnimation } from '../hooks/useLapAnimation';
import { usePlayback } from '../hooks/usePlayback';
import { useTrackSelection } from '../hooks/useTrackSelection';
import { TRACK_REGIONS } from '../data/tracks';

export interface TrackRecordsProps {
  className?: string;
}

export function TrackRecords({ className }: TrackRecordsProps) {
  const { region, visibleTracks, selectedTrackId, selectedTrack, selectTrack, selectRegion } =
    useTrackSelection();
  const { isPlaying, speed, toggle, toggleSpeed } = usePlayback();

  // One ref, two jobs: the animation resolves its nodes inside this subtree,
  // and visibility is measured on the same element.
  const { ref: panelRef, inView } = useInView<HTMLDivElement>({ threshold: 0, once: false });

  useLapAnimation({
    track: selectedTrack,
    isPlaying,
    speed,
    containerRef: panelRef,
    active: inView,
  });

  return (
    <div className={className}>
      <div className="mt-8 flex gap-1 md:mt-14 md:gap-2">
        {TRACK_REGIONS.map((name) => {
          const isActive = name === region;
          return (
            <button
              key={name}
              type="button"
              lang="en"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => selectRegion(name)}
              className={cn(
                'tracking-label stretch-wide cursor-pointer border-0 border-b-2 bg-transparent px-3.5 py-3 text-[12px] font-extrabold uppercase transition-colors duration-[250ms] md:px-[26px] md:py-3.5 md:text-[14px]',
                isActive
                  ? 'border-accent-primary text-text'
                  : 'hover:text-text text-text-muted border-transparent',
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div
        ref={panelRef}
        className="mt-3 grid items-start gap-7 md:mt-7 md:grid-cols-[minmax(300px,35fr)_65fr]"
      >
        <TrackList
          tracks={visibleTracks}
          selectedTrackId={selectedTrackId}
          onSelect={selectTrack}
        />
        {selectedTrack && (
          <TrackPanel
            track={selectedTrack}
            driverName={profile.name.toLocaleUpperCase('tr-TR')}
            isPlaying={isPlaying}
            speed={speed}
            onToggle={toggle}
            onToggleSpeed={toggleSpeed}
          />
        )}
      </div>
    </div>
  );
}
