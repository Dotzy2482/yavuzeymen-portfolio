import { describe, expect, it } from 'vitest';

import { HELMET_REVEAL, PORTRAIT_H, PORTRAIT_W } from './helmetReveal';
import {
  BLUR_SIGMA,
  CLEARANCE,
  FEATHER,
  HELMET_REGION,
  HELMET_REGION_MASK,
  NECK_LINE,
  helmetRegionSvg,
  raiseLine,
  type ImagePoint,
} from './helmetRegion';

function inside(polygon: readonly ImagePoint[], [x, y]: ImagePoint): boolean {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i] ?? [0, 0];
    const [xj, yj] = polygon[j] ?? [0, 0];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function distanceToSegment([px, py]: ImagePoint, [ax, ay]: ImagePoint, [bx, by]: ImagePoint) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/** Distance to the outline: positive outside the region, negative inside. */
function signedDistance(point: ImagePoint): number {
  let d = Infinity;
  for (let i = 0, j = HELMET_REGION.length - 1; i < HELMET_REGION.length; j = i++) {
    d = Math.min(
      d,
      distanceToSegment(point, HELMET_REGION[j] ?? [0, 0], HELMET_REGION[i] ?? [0, 0]),
    );
  }
  return inside(HELMET_REGION, point) ? -d : d;
}

/** The neck line sampled every photo pixel, not just at its vertices. */
function neckLineSamples(): ImagePoint[] {
  const out: ImagePoint[] = [];
  for (let i = 0; i < NECK_LINE.length - 1; i++) {
    const [ax, ay] = NECK_LINE[i] ?? [0, 0];
    const [bx, by] = NECK_LINE[i + 1] ?? [0, 0];
    const steps = Math.ceil(Math.hypot(bx - ax, by - ay));
    for (let s = 0; s < steps; s++)
      out.push([ax + ((bx - ax) * s) / steps, ay + ((by - ay) * s) / steps]);
  }
  return out;
}

/**
 * The helmet's silhouette in portrait-helmet.png, read off 5× crops of the
 * photo: crown, widest points, and the whole lower edge where shell and chin
 * bar meet the neck. The lower right corner is the tight one.
 */
const HELMET_EDGE: readonly ImagePoint[] = [
  [660, 3], // crown
  [471, 200], // widest, left
  [843, 200], // widest, right
  [482, 270],
  [495, 320],
  [515, 360],
  [536, 386],
  [550, 394],
  [558, 398], // lower left corner, where the shell meets the neck
  [600, 407],
  [660, 411], // chin bar rim, centre
  [733, 403],
  [755, 398], // lower right corner
  [770, 389],
  [785, 380],
  [800, 366],
  [820, 320],
  [832, 270],
];

/** Where the two exposures disagree — all of it must stay bare-headed. */
const BODY: readonly ImagePoint[] = [
  [557, 420], // collar, left corner
  [760, 412], // collar, right corner
  [662, 541], // bottom of the V-neck
  [430, 520], // left shoulder
  [900, 520], // right shoulder
  [660, 800], // arms
];

describe('HELMET_REGION', () => {
  it('ends its soft edge before the neck line, all along it', () => {
    // Fully transparent from FEATHER outside the outline; the line must be at
    // least the clearance further out still.
    const nearest = Math.min(...neckLineSamples().map(signedDistance));
    expect(nearest).toBeGreaterThanOrEqual(FEATHER + CLEARANCE - 0.25);
  });

  it('keeps the whole helmet fully opaque', () => {
    for (const point of HELMET_EDGE) expect(signedDistance(point)).toBeLessThanOrEqual(-FEATHER);
  });

  it('shows none of the body', () => {
    for (const point of BODY) expect(signedDistance(point)).toBeGreaterThanOrEqual(FEATHER);
  });

  it('holds the point the cursor reveal is centred on', () => {
    const head: ImagePoint = [HELMET_REVEAL.head.x * PORTRAIT_W, HELMET_REVEAL.head.y * PORTRAIT_H];
    expect(signedDistance(head)).toBeLessThan(-100);
  });
});

describe('raiseLine', () => {
  it('moves a straight line square to itself, towards the top of the frame', () => {
    const raised = raiseLine(
      [
        [0, 0],
        [10, 10],
        [20, 20],
      ],
      Math.SQRT2,
    );
    for (const [i, [x, y]] of raised.entries()) {
      expect(x).toBeCloseTo(i * 10 + 1, 10);
      expect(y).toBeCloseTo(i * 10 - 1, 10);
    }
  });
});

describe('helmetRegionSvg', () => {
  const svg = helmetRegionSvg();

  it("is drawn in the photos' own pixel space and stretches to the layer", () => {
    expect(svg).toContain(`viewBox="0 0 ${PORTRAIT_W} ${PORTRAIT_H}"`);
    expect(svg).toContain('preserveAspectRatio="none"');
  });

  it('cuts the blur off to exactly zero FEATHER outside the outline', () => {
    // The blur's alpha is 10% at 1.2816σ from a straight edge; the ramp sends
    // 10% to 0 and 90% to 1.
    expect(BLUR_SIGMA * 1.2816).toBeCloseTo(FEATHER, 6);
    expect(svg).toContain(`stdDeviation="${BLUR_SIGMA.toFixed(3)}"`);
    expect(svg).toContain('<feFuncA type="linear" slope="1.2500" intercept="-0.1250"/>');
  });

  it('is what the mask URL carries', () => {
    const match = /^url\("data:image\/svg\+xml,(.+)"\)$/.exec(HELMET_REGION_MASK);
    expect(decodeURIComponent(match?.[1] ?? '')).toBe(svg);
  });
});
