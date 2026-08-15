/**
 * The selectable list of circuits, with the series filter above it.
 *
 * TODO: implement the filter control (europe / america / asia / all).
 * TODO: add keyboard navigation — arrow keys move the selection, as this is
 *       effectively a listbox.
 * TODO: animate list entry/exit when the filter changes.
 */

import { cn } from '@/lib/cn';

import { TrackListItem } from './TrackListItem';
import type { SeriesFilter } from '../hooks/useTrackSelection';
import type { Track, TrackId } from '../data/types';

export interface TrackListProps {
  tracks: Track[];
  selectedTrackId: TrackId | null;
  seriesFilter: SeriesFilter;
  onSelect: (id: TrackId) => void;
  onFilterChange: (series: SeriesFilter) => void;
  className?: string;
}

export function TrackList({
  tracks,
  selectedTrackId,
  seriesFilter,
  onSelect,
  onFilterChange,
  className,
}: TrackListProps) {
  // TODO: render the filter control; `seriesFilter`/`onFilterChange` feed it.
  void seriesFilter;
  void onFilterChange;

  return (
    <ul className={cn('track-list', className)} role="listbox" aria-label="Circuits">
      {tracks.map((track) => (
        <TrackListItem
          key={track.id}
          track={track}
          isSelected={track.id === selectedTrackId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
