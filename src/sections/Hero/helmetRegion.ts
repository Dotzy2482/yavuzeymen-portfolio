/**
 * The part of the frame the helmeted photo may show in: the helmet, and nothing
 * below the neck.
 *
 * The two hero photographs are the same crop of the same pose, but they are two
 * exposures, and under the helmet the bodies do not quite agree — the collar
 * sits a few pixels apart and the neck is lit differently. Wherever the cursor
 * circle's soft edge crossed the neck or the shoulders, that disagreement showed
 * as a seam. The owner drew the fix onto a screenshot: a line just under the
 * chin bar, below which only the bare-headed photo may ever show.
 *
 * This module turns that line into a static mask, authored in the photos' own
 * 1323 × 1189 pixel space so it stays on them at every rendered size and aspect.
 * `HeroPortrait` puts it on the helmeted <img> and the cursor circle on the
 * wrapper around it, so the two intersect by nesting: a pixel shows only where
 * both let it through. This one is set once, at render; the per-frame loop
 * never touches it.
 */

import { PORTRAIT_H, PORTRAIT_W } from './helmetReveal';

/** A point in the photos' pixel space: `[x, y]`, y pointing down. */
export type ImagePoint = readonly [x: number, y: number];

/**
 * The neck line, left to right. At and below it the helmeted photo never shows.
 *
 * Traced from the owner's annotation — a 1149 × 559 crop of the site at
 * 1440 × 900 with a blue stroke drawn under the chin bar — by differencing it
 * against the same crop without the stroke. At 1440 × 900 the portrait box is
 * 1061.5 × 954 at (189.25, 55), a scale of 0.80234; matching the crop's torso
 * rows against a fresh render put its origin at (88, 16). So a stroke point
 * (sx, sy) sits at x = (sx + 88 − 189.25) / 0.80234, y = (sy + 16 − 55) /
 * 0.80234 in the photo. Every other stroke sample is kept, about 25px apart.
 *
 * The stroke runs from x ≈ 463 to 846 and hugs the chin bar: ~33px under its
 * rim at the centre, ~14px (measured square to the line) under its lower right
 * corner. The first and last points extend it along its own slope past the
 * helmet's sides, where both photos are empty.
 *
 * The owner then moved the stretch under the lower left corner up, with a
 * second stroke on a second screenshot (867 × 610, matched to the photo at a
 * scale of 0.815 by template-matching the shell): there the helmet photo's
 * shadowed neck still showed below the shell. That stroke runs from (539, 392)
 * to (598, 422) and sits on the shell's edge, so between those x the line is
 * the stroke lowered by FEATHER + CLEARANCE — the half-alpha outline lies on
 * the stroke, the helmet photo is gone 5px below it, and the corner's lowest
 * few pixels are part of the fade.
 */
export const NECK_LINE: readonly ImagePoint[] = [
  [420, 344], // extension
  [463, 371],
  [485, 385],
  [509, 398],
  // x 539–598: the owner's second stroke, under the chin bar's lower left
  // corner, lowered by FEATHER + CLEARANCE so the outline lies on it.
  [539, 401],
  [558, 409],
  [575, 413],
  [588, 420],
  [600, 428],
  [615, 435],
  [634, 441],
  [659, 444],
  [684, 443],
  [709, 437],
  [734, 427],
  [759, 412],
  [784, 398],
  [809, 384],
  [833, 367],
  [846, 357],
  [890, 323], // extension
];

/**
 * Half-width of the soft edge, in photo pixels. The helmet shows in full up to
 * `FEATHER` inside the outline and not at all from `FEATHER` outside it, so the
 * fade is 10px wide — 8 screen pixels at 1440 × 900. It is capped by the chin
 * bar's lower right corner, which must clear the line by the whole fade plus
 * `CLEARANCE` to stay fully opaque, and clears it by ~14px.
 */
export const FEATHER = 5;

/**
 * Room between the end of the fade and the neck line. On a phone the pinned
 * hero scales the layer every frame, and the compositor resamples its mask by
 * up to a screen pixel; at 390px wide a photo pixel is 0.39 of one, so 4 keeps
 * the resampled edge ~1.5 screen pixels clear of the line.
 */
export const CLEARANCE = 4;

/** Where the outline closes, above the top of the frame. */
const TOP = -60;

/**
 * The soft edge is a Gaussian blur followed by a linear alpha ramp that sends
 * 10% to 0 and 90% to 1. A plain blur never reaches zero; this one does, at a
 * known distance, which is what makes "never below the line" true rather than
 * nearly true. Along a straight edge the blurred alpha falls to 10% at
 * Φ⁻¹(0.9) ≈ 1.2816 standard deviations outside it — hence the σ below.
 */
const CUT = 0.1;
const Z_CUT = 1.2816;
export const BLUR_SIGMA = FEATHER / Z_CUT;

function unit(x: number, y: number): ImagePoint {
  const length = Math.hypot(x, y) || 1;
  return [x / length, y / length];
}

/**
 * Each neck-line point moved `distance` along its normal, towards the helmet.
 * The tangent is taken across the neighbours, so on this gentle curve the
 * moved points stay `distance` from the line to within a fraction of a pixel.
 */
export function raiseLine(line: readonly ImagePoint[], distance: number): ImagePoint[] {
  return line.map(([x, y], i) => {
    const [px, py] = line[Math.max(0, i - 1)] ?? [x, y];
    const [nx, ny] = line[Math.min(line.length - 1, i + 1)] ?? [x, y];
    const [tx, ty] = unit(nx - px, ny - py);
    // Left-to-right tangent (tx, ty); (ty, −tx) is its normal pointing up.
    return [x + ty * distance, y - tx * distance];
  });
}

/**
 * The region's outline: the neck line raised by the fade and the clearance,
 * then closed straight up past the top of the frame. The fade straddles this
 * outline, so it is spent entirely above the neck line.
 */
export const HELMET_REGION: readonly ImagePoint[] = (() => {
  const lower = raiseLine(NECK_LINE, FEATHER + CLEARANCE);
  const first = lower[0] ?? [0, 0];
  const last = lower[lower.length - 1] ?? [PORTRAIT_W, 0];
  return [...lower, [last[0], TOP], [first[0], TOP]];
})();

/** The region as an SVG document in the photos' pixel space. */
export function helmetRegionSvg(): string {
  const d = HELMET_REGION.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  const slope = 1 / (1 - 2 * CUT);
  // `preserveAspectRatio="none"` lets the mask be stretched to the layer's box,
  // which has the photos' aspect ratio, so the path lands on the same pixels at
  // any size. The fill is only read for its alpha.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PORTRAIT_W} ${PORTRAIT_H}" preserveAspectRatio="none">` +
    `<filter id="f"><feGaussianBlur stdDeviation="${BLUR_SIGMA.toFixed(3)}"/>` +
    `<feComponentTransfer><feFuncA type="linear" slope="${slope.toFixed(4)}" intercept="${(-CUT * slope).toFixed(4)}"/></feComponentTransfer>` +
    `</filter><path d="${d.join('')}Z" filter="url(#f)"/></svg>`
  );
}

/** Ready for `mask-image`. */
export const HELMET_REGION_MASK = `url("data:image/svg+xml,${encodeURIComponent(helmetRegionSvg())}")`;
