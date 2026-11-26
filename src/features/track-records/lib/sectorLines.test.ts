import { describe, expect, it } from 'vitest';

import {
  SECTOR_LABEL_ASIDE,
  SECTOR_LABEL_BOX,
  getSectorMarkers,
  parsePolyline,
  pointAtFraction,
} from './sectorLines';
import { tracks } from '../data/tracks';
import { TRACK_VIEW_HEIGHT, TRACK_VIEW_WIDTH } from '../data/types';

// A 400 × 200 rectangle run clockwise from its top-left corner: 1200 units.
const BOX = 'M100 100L500 100L500 300L100 300Z';

describe('parsePolyline', () => {
  it('reads the vertices of a generated path', () => {
    expect(parsePolyline('M1.5 2L3 4.25Z')).toEqual([
      [1.5, 2],
      [3, 4.25],
    ]);
  });
});

describe('pointAtFraction', () => {
  it('walks the closed outline, closing segment included', () => {
    const points = parsePolyline(BOX);
    expect(pointAtFraction(points, 0)).toMatchObject({ x: 100, y: 100, angle: 0 });
    expect(pointAtFraction(points, 0.25)).toMatchObject({ x: 400, y: 100 });
    expect(pointAtFraction(points, 0.5)).toMatchObject({ x: 500, y: 300 });
    const back = pointAtFraction(points, 11 / 12);
    expect(back.x).toBeCloseTo(100);
    expect(back.y).toBeCloseTo(200);
    expect(back.angle).toBeCloseTo(-Math.PI / 2);
  });
});

describe('getSectorMarkers', () => {
  it('names the lines after the sectors they begin', () => {
    expect(getSectorMarkers(BOX, [0.25, 0.5]).map((m) => m.label)).toEqual(['S2', 'S3']);
  });

  it('puts each tick on the line and turns it across the direction of travel', () => {
    const [s2, s3] = getSectorMarkers(BOX, [0.25, 0.6]);
    expect(s2).toMatchObject({ x: 400, y: 100, tickAngle: 0 });
    expect(s3).toMatchObject({ x: 380, y: 300, tickAngle: 180 });
  });

  it('keeps the label beside the track, on the side away from the rest of the lap', () => {
    // A long, thin loop: inside it, the other straight is 40 units away, so
    // each label goes outside — above the top straight, below the bottom one.
    const thin = 'M100 100L500 100L500 140L100 140Z';
    const [top, bottom] = getSectorMarkers(thin, [0.2, 0.6]);
    expect(top.labelX).toBeCloseTo(0);
    expect(top.labelY).toBeCloseTo(-SECTOR_LABEL_ASIDE);
    expect(top.dominantBaseline).toBe('auto');
    expect(bottom.labelY).toBeCloseTo(SECTOR_LABEL_ASIDE);
    expect(bottom.dominantBaseline).toBe('hanging');
  });

  it('is empty for a path it cannot read', () => {
    expect(getSectorMarkers('', [0.3, 0.6])).toEqual([]);
  });
});

describe('sector markers on the real circuits', () => {
  // The generator refuses to write a circuit whose sector label would clip;
  // this is the same check from the component's side.
  it('never clips a sector label at the edge of the viewBox', () => {
    for (const track of tracks) {
      for (const marker of getSectorMarkers(track.path, track.sectors)) {
        const left =
          marker.x + marker.labelX - (marker.textAnchor === 'end' ? SECTOR_LABEL_BOX.width : 0);
        const top =
          marker.y +
          marker.labelY -
          (marker.dominantBaseline === 'auto' ? SECTOR_LABEL_BOX.height : 0);
        const where = `${track.id} ${marker.label}`;
        expect(left, where).toBeGreaterThanOrEqual(0);
        expect(left + SECTOR_LABEL_BOX.width, where).toBeLessThanOrEqual(TRACK_VIEW_WIDTH);
        expect(top, where).toBeGreaterThanOrEqual(0);
        expect(top + SECTOR_LABEL_BOX.height, where).toBeLessThanOrEqual(TRACK_VIEW_HEIGHT);
      }
    }
  });

  it('has every circuit split into three sectors, in order, none under 5% of the lap', () => {
    for (const track of tracks) {
      const [s2, s3] = track.sectors;
      expect(s2, track.id).toBeGreaterThanOrEqual(0.05);
      expect(s3 - s2, track.id).toBeGreaterThanOrEqual(0.05);
      expect(1 - s3, track.id).toBeGreaterThanOrEqual(0.05);
    }
  });
});
