/**
 * Root of the track-records feature and its only public component.
 *
 * Owns the shared state (selection, playback) and hands it down; the child
 * components stay presentational. Nothing outside this module reaches past
 * this component.
 *
 * TODO: pass playback state into TrackPanel once the hooks are implemented.
 * TODO: decide the mobile layout — list above panel, or a horizontal chip row.
 */

import { cn } from '@/lib/cn';

import { TrackList } from './TrackList';
import { TrackPanel } from './TrackPanel';
import { useTrackSelection } from '../hooks/useTrackSelection';

export interface TrackRecordsProps {
  className?: string;
}

export function TrackRecords({ className }: TrackRecordsProps) {
  const {
    visibleTracks,
    selectedTrackId,
    selectedTrack,
    seriesFilter,
    selectTrack,
    setSeriesFilter,
  } = useTrackSelection();

  return (
    <div className={cn('track-records', className)}>
      <TrackList
        tracks={visibleTracks}
        selectedTrackId={selectedTrackId}
        seriesFilter={seriesFilter}
        onSelect={selectTrack}
        onFilterChange={setSeriesFilter}
      />
      <TrackPanel track={selectedTrack} />
    </div>
  );
}
