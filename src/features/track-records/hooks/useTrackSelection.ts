/**
 * Owns "which track is selected" and "which series is being filtered".
 *
 * The single source of truth for the section's selection state — TrackList and
 * TrackPanel both read from here rather than holding their own copies.
 *
 * TODO: implement with useState + useMemo for the filtered list.
 * TODO: when the filter changes and the selected track falls out of the
 *       filtered set, select the first remaining track instead of showing an
 *       empty panel.
 * TODO: decide whether the selection should sync to the URL hash so a specific
 *       track can be linked to.
 */

import { tracks } from '../data/tracks';
import type { Track, TrackId, TrackSeries } from '../data/types';

/** `null` means "all series". */
export type SeriesFilter = TrackSeries | null;

export interface UseTrackSelectionResult {
  /** Tracks matching the current filter, in display order. */
  visibleTracks: Track[];
  selectedTrackId: TrackId | null;
  /** The selected track, or null when nothing matches the filter. */
  selectedTrack: Track | null;
  seriesFilter: SeriesFilter;
  selectTrack: (id: TrackId) => void;
  setSeriesFilter: (series: SeriesFilter) => void;
}

export function useTrackSelection(): UseTrackSelectionResult {
  // Stub: no state yet — always reports the full list with nothing selected.
  return {
    visibleTracks: tracks,
    selectedTrackId: null,
    selectedTrack: null,
    seriesFilter: null,
    selectTrack: () => {},
    setSeriesFilter: () => {},
  };
}
