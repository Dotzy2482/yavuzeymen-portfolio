import { describe, expect, it } from 'vitest';

import { formatDelta, formatLapTime, formatSectorTime, parseLapTime } from './formatLapTime';
import { tracks } from '../data/tracks';

describe('formatLapTime', () => {
  it('formats milliseconds as M:SS.mmm', () => {
    expect(formatLapTime(102_318)).toBe('1:42.318');
  });

  it('zero-pads seconds and milliseconds', () => {
    expect(formatLapTime(61_007)).toBe('1:01.007');
  });

  it('clamps invalid input to zero rather than printing NaN', () => {
    expect(formatLapTime(Number.NaN)).toBe('0:00.000');
    expect(formatLapTime(-5)).toBe('0:00.000');
  });
});

describe('parseLapTime', () => {
  it('parses M:SS.mmm to milliseconds', () => {
    expect(parseLapTime('1:42.318')).toBe(102_318);
  });

  it('rejects malformed input', () => {
    expect(parseLapTime('42.318')).toBeNull();
    expect(parseLapTime('')).toBeNull();
    expect(parseLapTime('1:42')).toBeNull();
  });
});

describe('chronometer / list agreement', () => {
  // The design's core timing rule: the chronometer shows `fraction × lapMs`,
  // so as the dot crosses the line (fraction 1) it must land exactly on the
  // best lap printed in the track list. Any track whose string does not
  // round-trip would display a different time in the panel than in the list.
  it.each(tracks)('$name round-trips its lap time', (track) => {
    const ms = parseLapTime(track.lap);
    expect(ms).not.toBeNull();
    expect(formatLapTime(ms as number)).toBe(track.lap);
  });
});

describe('sector and delta formatting', () => {
  it('formats sector times without a minute field', () => {
    expect(formatSectorTime(23_451)).toBe('23.451');
  });

  it('signs deltas in both directions', () => {
    expect(formatDelta(312)).toBe('+0.312');
    expect(formatDelta(-312)).toBe('-0.312');
  });
});
