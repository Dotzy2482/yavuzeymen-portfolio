/**
 * Owns "which track is selected" and "which region is being filtered".
 *
 * The single source of truth for the section's selection state — the list,
 * the chips and the panel all read from here rather than holding their own
 * copies. Switching region always lands on that region's first track, so the
 * panel is never left empty.
 */

import { useCallback, useMemo, useState } from 'react';

import { tracks } from '../data/tracks';
import type { Track, TrackId, TrackRegion } from '../data/types';

export interface UseTrackSelectionResult {
  region: TrackRegion;
  /** Tracks in the current region, in display order. */
  visibleTracks: Track[];
  selectedTrackId: TrackId | null;
  /** The selected track, or null when the region is somehow empty. */
  selectedTrack: Track | null;
  selectTrack: (id: TrackId) => void;
  selectRegion: (region: TrackRegion) => void;
}

export function useTrackSelection(initialRegion: TrackRegion = 'EUROPE'): UseTrackSelectionResult {
  const [region, setRegion] = useState<TrackRegion>(initialRegion);
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId | null>(
    () => tracks.find((track) => track.region === initialRegion)?.id ?? null,
  );

  const visibleTracks = useMemo(() => tracks.filter((track) => track.region === region), [region]);

  const selectedTrack = useMemo(
    () => visibleTracks.find((track) => track.id === selectedTrackId) ?? visibleTracks[0] ?? null,
    [visibleTracks, selectedTrackId],
  );

  const selectRegion = useCallback((next: TrackRegion) => {
    setRegion(next);
    setSelectedTrackId(tracks.find((track) => track.region === next)?.id ?? null);
  }, []);

  const selectTrack = useCallback((id: TrackId) => setSelectedTrackId(id), []);

  return {
    region,
    visibleTracks,
    selectedTrackId: selectedTrack?.id ?? null,
    selectedTrack,
    selectTrack,
    selectRegion,
  };
}
