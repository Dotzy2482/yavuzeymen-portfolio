import { describe, expect, it } from 'vitest';

import {
  getPathLength,
  getPointAtDistance,
  getProgressDash,
  getSectorFill,
  getTrailDash,
  wrapDistance,
  wrapProgress,
} from './svgPath';
import { tracks } from '../data/tracks';
import { TRAIL_LENGTH } from '../data/types';

describe('geometry guards', () => {
  // jsdom implements none of SVGGeometryElement; the helpers must degrade
  // rather than throw, or every test that mounts the panel would explode.
  it('returns zero length for a null or non-geometric element', () => {
    expect(getPathLength(null)).toBe(0);
    expect(getPathLength({} as SVGPathElement)).toBe(0);
  });

  it('returns the origin for a null element', () => {
    expect(getPointAtDistance(null, 100)).toEqual({ x: 0, y: 0, angle: 0 });
  });
});

describe('wrapProgress', () => {
  it('wraps values into 0–1', () => {
    expect(wrapProgress(2.25)).toBeCloseTo(0.25);
    expect(wrapProgress(-0.1)).toBeCloseTo(0.9);
    expect(wrapProgress(0.5)).toBeCloseTo(0.5);
  });

  it('treats non-finite input as the start line', () => {
    expect(wrapProgress(Number.NaN)).toBe(0);
  });
});

describe('wrapDistance', () => {
  it('wraps past the end of the path', () => {
    expect(wrapDistance(2500, 2000)).toBe(500);
    expect(wrapDistance(-100, 2000)).toBe(1900);
  });

  it('is safe on a zero-length path', () => {
    expect(wrapDistance(100, 0)).toBe(0);
  });
});

describe('getSectorFill', () => {
  it('fills each sector across its own third of the lap', () => {
    expect(getSectorFill(0, 0)).toBe(0);
    expect(getSectorFill(1 / 6, 0)).toBeCloseTo(0.5);
    expect(getSectorFill(1 / 3, 0)).toBe(1);
  });

  it('leaves later sectors empty until reached, then clamps', () => {
    expect(getSectorFill(0.2, 1)).toBe(0);
    expect(getSectorFill(0.5, 1)).toBeCloseTo(0.5);
    expect(getSectorFill(0.9, 1)).toBe(1);
    expect(getSectorFill(1, 2)).toBe(1);
  });
});

describe('dash maths', () => {
  it('reveals the lap up to the current distance', () => {
    expect(getProgressDash(500, 2000)).toBe('500 2000');
  });

  it('never emits a negative dash', () => {
    expect(getProgressDash(-10, 2000)).toBe('0 2000');
  });

  it('pins the trail so its leading edge sits on the dot', () => {
    // Past the first TRAIL_LENGTH units the segment is fixed and the offset
    // carries it forward with the dot.
    const trail = getTrailDash(500, 2000, TRAIL_LENGTH);
    expect(trail.dasharray).toBe(`${TRAIL_LENGTH} 2000`);
    expect(trail.dashoffset).toBe(TRAIL_LENGTH - 500);
  });

  it('grows the trail from zero at the start of the lap', () => {
    const trail = getTrailDash(30, 2000, TRAIL_LENGTH);
    expect(trail.dasharray).toBe('30 2000');
    expect(trail.dashoffset).toBe(0);
  });
});

describe('track data integrity', () => {
  it('has twelve circuits across three regions', () => {
    expect(tracks).toHaveLength(12);
    expect(new Set(tracks.map((t) => t.region))).toEqual(new Set(['EUROPE', 'AMERICA', 'ASIA']));
  });

  it('gives every circuit a single closed subpath', () => {
    for (const track of tracks) {
      // One move-to command only: getPointAtLength() walks a single subpath.
      expect(track.path.match(/M/g)).toHaveLength(1);
      expect(track.path.trimEnd().endsWith('Z')).toBe(true);
    }
  });

  it('gives every circuit a unique id', () => {
    expect(new Set(tracks.map((t) => t.id)).size).toBe(tracks.length);
  });
});
