/**
 * The track picker, in both its forms:
 * - desktop: a bordered vertical list of rows,
 * - mobile: a horizontally scrollable row of chips, each at least 44px tall.
 *
 * Both render the same data and drive the same selection; which one is
 * visible is purely a media-query decision, and `display: none` keeps the
 * hidden one out of the tab order and out of the accessibility tree.
 */

import { cn } from '@/lib/cn';

import { FlagChip } from './FlagChip';
import { TrackListItem } from './TrackListItem';
import type { Track, TrackId } from '../data/types';

export interface TrackListProps {
  tracks: Track[];
  selectedTrackId: TrackId | null;
  onSelect: (id: TrackId) => void;
  className?: string;
}

export function TrackList({ tracks, selectedTrackId, onSelect, className }: TrackListProps) {
  return (
    <>
      {/* Desktop list */}
      <div
        className={cn(
          'border-hairline bg-surface-2 hidden min-w-0 overflow-hidden border md:block',
          className,
        )}
      >
        {tracks.map((track, index) => (
          <TrackListItem
            key={track.id}
            track={track}
            index={index}
            isActive={track.id === selectedTrackId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Mobile chips */}
      <div className="-mx-[var(--gutter)] flex gap-2.5 overflow-x-auto px-[var(--gutter)] pt-5 pb-2 md:hidden">
        {tracks.map((track) => {
          const isActive = track.id === selectedTrackId;
          return (
            <button
              key={track.id}
              type="button"
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelect(track.id)}
              className={cn(
                'flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 border px-4 py-3 transition-colors duration-[250ms]',
                isActive
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-hairline-strong bg-surface',
              )}
            >
              <FlagChip country={track.country} size="sm" />
              <span
                lang="en"
                className="tracking-ui stretch-ui text-[12px] font-extrabold whitespace-nowrap uppercase"
              >
                {track.name}
              </span>
              <span className="num text-text-secondary text-[11px] whitespace-nowrap">
                {track.lap}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
