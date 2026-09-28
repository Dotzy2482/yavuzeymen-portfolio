import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTrackSelection } from './useTrackSelection';
import { TRACK_REGIONS, tracks } from '../data/tracks';
import type { Track, TrackRegion } from '../data/types';

// Every expectation below is derived from the data, never written out: region
// names, circuit counts and ids all change as real data lands, and the
// selection contract has to hold for whatever the data says.

/** The circuits a region should list, in data order. */
function tracksIn(region: TrackRegion): Track[] {
  return tracks.filter((track) => track.region === region);
}

/** The region's last circuit — the one a stale selection would stick on. */
function lastTrackIn(region: TrackRegion): Track {
  const list = tracksIn(region);
  return list[list.length - 1];
}

/** A region other than `region`, for switching away from it. */
function otherRegion(region: TrackRegion): TrackRegion {
  const other = TRACK_REGIONS.find((candidate) => candidate !== region);
  if (!other) throw new Error('the data needs at least two regions to switch between');
  return other;
}

/**
 * A region with a circuit after its first, so that "lands on the first" can be
 * told apart from "kept the old selection".
 */
function regionWithChoice(): TrackRegion {
  const region = TRACK_REGIONS.find((candidate) => tracksIn(candidate).length > 1);
  if (!region) throw new Error('the data needs a region with at least two circuits');
  return region;
}

describe('useTrackSelection', () => {
  describe('on mount', () => {
    it('opens on a region with circuits, showing its first', () => {
      const { result } = renderHook(() => useTrackSelection());
      const expected = tracksIn(result.current.region);

      expect(TRACK_REGIONS).toContain(result.current.region);
      expect(result.current.visibleTracks).toEqual(expected);
      expect(result.current.selectedTrack).toBe(expected[0]);
      expect(result.current.selectedTrackId).toBe(expected[0].id);
    });

    it.each(TRACK_REGIONS)('opens on %s when asked to', (region) => {
      const { result } = renderHook(() => useTrackSelection(region));
      const expected = tracksIn(region);

      expect(result.current.region).toBe(region);
      expect(result.current.visibleTracks).toEqual(expected);
      expect(result.current.selectedTrack).toBe(expected[0]);
      expect(result.current.selectedTrackId).toBe(expected[0].id);
    });
  });

  describe('selectRegion', () => {
    it.each(TRACK_REGIONS)(
      'switching to %s lists its circuits and lands on the first',
      (region) => {
        // Start in another region, parked on its last circuit, so a switch that
        // kept the old selection would be caught.
        const from = otherRegion(region);
        const { result } = renderHook(() => useTrackSelection(from));
        act(() => result.current.selectTrack(lastTrackIn(from).id));

        act(() => result.current.selectRegion(region));

        const expected = tracksIn(region);
        expect(result.current.region).toBe(region);
        expect(result.current.visibleTracks).toEqual(expected);
        expect(result.current.selectedTrack).toBe(expected[0]);
        expect(result.current.selectedTrackId).toBe(expected[0].id);
      },
    );

    it('does not remember a region’s previous selection on the way back', () => {
      const region = regionWithChoice();
      const { result } = renderHook(() => useTrackSelection(region));
      act(() => result.current.selectTrack(lastTrackIn(region).id));

      act(() => result.current.selectRegion(otherRegion(region)));
      act(() => result.current.selectRegion(region));

      expect(result.current.selectedTrack).toBe(tracksIn(region)[0]);
    });

    it('recovers from a region with no circuits instead of keeping a stale one', () => {
      // TrackRegion cannot name an empty region — only a data edit can make
      // one, and this is what the panel would be handed if it did. The hook
      // promises null rather than a circuit the list is not showing.
      const empty = 'NO_SUCH_REGION' as unknown as TrackRegion;
      const region = TRACK_REGIONS[0];
      const { result } = renderHook(() => useTrackSelection(region));

      act(() => result.current.selectRegion(empty));
      expect(result.current.visibleTracks).toEqual([]);
      expect(result.current.selectedTrack).toBeNull();
      expect(result.current.selectedTrackId).toBeNull();

      act(() => result.current.selectRegion(region));
      expect(result.current.selectedTrack).toBe(tracksIn(region)[0]);
    });
  });

  describe('selectTrack', () => {
    it.each(tracks)('selects $name without leaving its region', (track) => {
      const { result } = renderHook(() => useTrackSelection(track.region));

      act(() => result.current.selectTrack(track.id));

      expect(result.current.selectedTrack).toBe(track);
      expect(result.current.selectedTrackId).toBe(track.id);
      expect(result.current.region).toBe(track.region);
      expect(result.current.visibleTracks).toEqual(tracksIn(track.region));
    });

    it('never reports a circuit the list is not showing', () => {
      // An id from another region is not in the list, so it cannot be the
      // selection: the panel and the list's highlight would disagree. Both
      // the track and the id fall back to the first visible circuit.
      const region = TRACK_REGIONS[0];
      const foreign = tracks.find((track) => track.region !== region);
      if (!foreign) throw new Error('the data needs a circuit outside the first region');
      const { result } = renderHook(() => useTrackSelection(region));

      act(() => result.current.selectTrack(foreign.id));

      expect(result.current.region).toBe(region);
      expect(result.current.selectedTrack).toBe(tracksIn(region)[0]);
      expect(result.current.selectedTrackId).toBe(tracksIn(region)[0].id);
    });

    it('falls back to the first circuit for an id it does not know', () => {
      const region = regionWithChoice();
      const { result } = renderHook(() => useTrackSelection(region));
      act(() => result.current.selectTrack(lastTrackIn(region).id));

      act(() => result.current.selectTrack('NO_SUCH_TRACK'));

      expect(result.current.selectedTrack).toBe(tracksIn(region)[0]);
      expect(result.current.selectedTrackId).toBe(tracksIn(region)[0].id);
    });
  });

  it('hands out the same callbacks on every render', () => {
    const { result, rerender } = renderHook(() => useTrackSelection());
    const { selectTrack, selectRegion } = result.current;

    act(() => result.current.selectRegion(otherRegion(result.current.region)));
    act(() => result.current.selectTrack(lastTrackIn(result.current.region).id));
    rerender();

    expect(result.current.selectTrack).toBe(selectTrack);
    expect(result.current.selectRegion).toBe(selectRegion);
  });

  // The hook only promises "never empty" for a region that has circuits. These
  // hold the data to its half of that bargain, so a region rename or a circuit
  // moving region cannot leave a tab that opens onto nothing.
  describe('region coverage', () => {
    it('lists each region once', () => {
      expect(new Set(TRACK_REGIONS).size).toBe(TRACK_REGIONS.length);
    });

    it.each(TRACK_REGIONS)('gives the %s tab at least one circuit', (region) => {
      expect(tracksIn(region).length).toBeGreaterThan(0);
    });

    it('files every circuit under a region that has a tab', () => {
      for (const track of tracks) expect(TRACK_REGIONS).toContain(track.region);
    });
  });
});
