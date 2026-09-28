import { describe, expect, it } from 'vitest';

import {
  START_LABEL_AHEAD,
  START_LABEL_ASIDE,
  getStartDirection,
  getStartLineMarker,
} from './startLine';
import { tracks } from '../data/tracks';
import { TRACK_VIEW_HEIGHT, TRACK_VIEW_WIDTH } from '../data/types';

describe('getStartDirection', () => {
  it('reads the first segment in SVG angles', () => {
    expect(getStartDirection('M0 0L10 0L10 10Z')).toBe(0);
    expect(getStartDirection('M0 0L0 10L10 10Z')).toBe(90);
    expect(getStartDirection('M10 10L0 10L0 0Z')).toBe(180);
    expect(getStartDirection('M 0 10 L 0 0 L 10 0 Z')).toBe(-90);
  });

  it("falls back to the design's orientation when there is nothing to read", () => {
    expect(getStartDirection('')).toBe(0);
    expect(getStartDirection('M5 5L5 5Z')).toBe(0);
  });
});

describe('getStartLineMarker', () => {
  it("reproduces the design's placement on a straight heading right", () => {
    expect(getStartLineMarker('M150 500L640 500Z')).toEqual({
      tickAngle: 0,
      labelX: 16,
      labelY: -22,
      textAnchor: 'start',
      dominantBaseline: 'auto',
    });
  });

  it('keeps the label ahead of the line and clear to one side, whichever way the straight runs', () => {
    for (let degrees = -180; degrees < 180; degrees += 15) {
      const r = (degrees * Math.PI) / 180;
      for (const x of [200, 800]) {
        const d = `M${x} 300L${x + 100 * Math.cos(r)} ${300 + 100 * Math.sin(r)}Z`;
        const { labelX, labelY } = getStartLineMarker(d);
        const ahead = labelX * Math.cos(r) + labelY * Math.sin(r);
        const aside = labelX * Math.sin(r) - labelY * Math.cos(r);
        expect(ahead).toBeCloseTo(START_LABEL_AHEAD, 0);
        expect(Math.abs(aside)).toBeCloseTo(START_LABEL_ASIDE, 0);
      }
    }
  });

  it('puts the label on the side of the track away from the driver plate', () => {
    // A straight running down the map: the plate sits right of the dot on the
    // left of the map, and flips to its left past two-thirds of the width.
    expect(getStartLineMarker('M300 100L300 500Z').labelX).toBeLessThan(0);
    expect(getStartLineMarker('M800 100L800 500Z').labelX).toBeGreaterThan(0);
  });

  it('turns the tick across the direction of travel', () => {
    expect(getStartLineMarker('M500 300L500 100Z').tickAngle).toBe(-90);
    expect(getStartLineMarker('M500 300L300 300Z').tickAngle).toBe(180);
  });
});

describe('start/finish marker on the real circuits', () => {
  // The generator refuses to write a circuit whose label would clip; this is
  // the same estimate from the component's side, so the two cannot drift.
  const LABEL_WIDTH = 3 * 0.7 * 22;
  const LABEL_HEIGHT = 0.8 * 22;

  it('never clips the S/F label at the edge of the viewBox', () => {
    for (const track of tracks) {
      const [, x, y] = /^M([\d.]+) ([\d.]+)/.exec(track.path) ?? [];
      const marker = getStartLineMarker(track.path);
      const left = Number(x) + marker.labelX - (marker.textAnchor === 'end' ? LABEL_WIDTH : 0);
      const top =
        Number(y) + marker.labelY - (marker.dominantBaseline === 'auto' ? LABEL_HEIGHT : 0);
      expect(left, track.id).toBeGreaterThanOrEqual(0);
      expect(left + LABEL_WIDTH, track.id).toBeLessThanOrEqual(TRACK_VIEW_WIDTH);
      expect(top, track.id).toBeGreaterThanOrEqual(0);
      expect(top + LABEL_HEIGHT, track.id).toBeLessThanOrEqual(TRACK_VIEW_HEIGHT);
    }
  });
});
