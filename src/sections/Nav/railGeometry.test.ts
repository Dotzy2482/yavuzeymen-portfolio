import { describe, expect, it } from 'vitest';

import { SECTION_IDS } from '@/lib/constants';

import {
  LAST_SECTION_NUMBER,
  RAIL_LABELS,
  nearestTick,
  progressAtPointer,
  scrollTopFor,
  sectionIndexAt,
  sectionNumber,
  tickPositions,
} from './railGeometry';

/**
 * Section tops and scroll range measured from the real page at 1440x900, so
 * the numbers below are the proportions the rail actually has to draw — Sim to
 * Real's 240vh pin included.
 */
const TOPS_1440 = [0, 900, 2004, 3171, 3948, 5137, 7297, 8404, 9356, 10044];
const MAX_1440 = 10053;

describe('tickPositions', () => {
  it("puts each section's notch where its top reaches the top of the viewport", () => {
    const ticks = tickPositions(TOPS_1440, MAX_1440);

    expect(ticks[0]).toBe(0);
    expect(ticks[5]).toBeCloseTo(5137 / MAX_1440, 10);
    // Uneven on purpose: the pinned gallery makes Sim to Real the longest
    // stretch of rail, and the notches have to say so.
    const gaps = ticks.slice(1).map((t, i) => (t ?? 0) - (ticks[i] ?? 0));
    expect(Math.max(...gaps)).toBeCloseTo((7297 - 5137) / MAX_1440, 10);
  });

  it('pins a section the page cannot scroll its top to at the end of the rail', () => {
    // A short last section: its top sits below the furthest the page can go.
    expect(tickPositions([0, 500, 1300], 1000)).toEqual([0, 0.5, 1]);
  });

  it('gives a missing section no notch', () => {
    expect(tickPositions([0, null, 800], 1000)).toEqual([0, null, 0.8]);
  });

  it('puts everything at the start of a page that does not scroll', () => {
    expect(tickPositions([0, 300, 600], 0)).toEqual([0, 0, 0]);
  });
});

describe('sectionIndexAt', () => {
  const ticks = tickPositions(TOPS_1440, MAX_1440);
  const onePixel = 1 / MAX_1440;

  it('reports the last section whose start the head has reached', () => {
    expect(sectionIndexAt(0, ticks, onePixel)).toBe(0);
    expect(sectionIndexAt(4000 / MAX_1440, ticks, onePixel)).toBe(4); // in Track Records
    expect(sectionIndexAt(1, ticks, onePixel)).toBe(SECTION_IDS.length - 1);
  });

  it('counts a section as reached from its first pixel, within rounding', () => {
    // A jump lands on a whole pixel; a measured top can be a fraction short of
    // one. Neither should leave the readout on the section before.
    const fractional = tickPositions([0, 900.4], 2000);
    expect(sectionIndexAt(900 / 2000, fractional, 1 / 2000)).toBe(1);
    expect(sectionIndexAt(899 / 2000, fractional, 1 / 2000)).toBe(0);
  });

  it('skips sections that have no notch', () => {
    expect(sectionIndexAt(0.9, [0, null, 0.5, null], 0)).toBe(2);
  });
});

describe('progressAtPointer', () => {
  const rail = { top: 72, height: 732 };

  it('maps the rail linearly onto the scroll range', () => {
    expect(progressAtPointer(72, rail)).toBe(0);
    expect(progressAtPointer(72 + 366, rail)).toBe(0.5);
    expect(progressAtPointer(72 + 732, rail)).toBe(1);
  });

  it('clamps a pointer dragged past either end', () => {
    expect(progressAtPointer(-400, rail)).toBe(0);
    expect(progressAtPointer(2000, rail)).toBe(1);
  });

  it('keeps the head where it was grabbed rather than snapping it to the pointer', () => {
    // Took hold of the head 4px below its centre, then moved 100px down.
    const head = 72 + 366;
    expect(progressAtPointer(head + 4, rail, 4)).toBe(0.5);
    expect(progressAtPointer(head + 104, rail, 4)).toBeCloseTo(0.5 + 100 / 732, 10);
  });

  it('does not divide by a rail that has not been laid out', () => {
    expect(progressAtPointer(100, { top: 0, height: 0 })).toBe(0);
  });
});

describe('nearestTick', () => {
  const ticks = [0, 0.1, 0.105, 0.5, null, 1];

  it('snaps to a notch within the radius', () => {
    // 1000px of rail, 8px of radius: 0.495 is 5px from the notch at 0.5.
    expect(nearestTick(0.495, ticks, 1000, 8)).toBe(3);
  });

  it('leaves the bare rail alone', () => {
    expect(nearestTick(0.3, ticks, 1000, 8)).toBe(-1);
  });

  it('prefers the nearer of two notches inside the radius', () => {
    expect(nearestTick(0.104, ticks, 1000, 8)).toBe(2);
    expect(nearestTick(0.101, ticks, 1000, 8)).toBe(1);
  });

  it('ignores missing notches and unlaid rails', () => {
    expect(nearestTick(0.75, ticks, 1000, 8)).toBe(-1);
    expect(nearestTick(0.5, ticks, 0, 8)).toBe(-1);
  });
});

describe('scrollTopFor', () => {
  it('lands on whole pixels inside the scroll range', () => {
    expect(scrollTopFor(0.5, 10053)).toBe(5027);
    expect(scrollTopFor(-0.2, 10053)).toBe(0);
    expect(scrollTopFor(1.4, 10053)).toBe(10053);
  });

  it('round-trips a notch to its section top', () => {
    const ticks = tickPositions(TOPS_1440, MAX_1440);
    ticks.forEach((tick, i) => expect(scrollTopFor(tick ?? 0, MAX_1440)).toBe(TOPS_1440[i]));
  });
});

describe('labels', () => {
  it('numbers sections the way the page does', () => {
    expect(sectionNumber(0)).toBe('00');
    expect(sectionNumber(4)).toBe('04');
    expect(LAST_SECTION_NUMBER).toBe('09');
  });

  it('has a plate label for every section', () => {
    for (const id of SECTION_IDS) expect(RAIL_LABELS[id]).toMatch(/\S/);
  });
});
