/**
 * Configuration for the hero helmet's scan reveal — the one file to edit when
 * tuning the effect.
 *
 * It lives apart from both the hook and the component on purpose: the component
 * file may only export components (Fast Refresh), and putting the numbers next
 * to the hook would bury the alignment control in code that never reads it.
 *
 * The effect itself is in `useHelmetScan.ts`; the layers are in
 * `HelmetScanReveal.tsx`.
 */

export const HELMET_PHOTO = '/images/hero/helmet.png';

/** Intrinsic size of HELMET_PHOTO, so the layer reserves its box before load. */
export const PHOTO_W = 492;
export const PHOTO_H = 508;

export interface WireframeOffset {
  /** Nudge right, in CSS pixels of the rendered helmet. */
  x: number;
  /** Nudge down, in CSS pixels of the rendered helmet. */
  y: number;
  /** 1 = same size as the photo. Scales about the centre. */
  scale: number;
}

/**
 * Every tunable of the effect.
 *
 * `wireframeOffset` is the alignment control. The wireframe's viewBox is the
 * same aspect as the helmet photo (1274/1234 against 508/492), so the identity
 * transform already lines the two up — nudge these only to correct for the
 * drawing's own line weight.
 */
export const HELMET_SCAN = {
  /** Band thickness, as a percentage of the gradient line. */
  bandWidth: 9,
  /** Wider below `md`: the helmet is smaller there, so 9% reads as a hairline. */
  bandWidthMobile: 14,
  /** CSS gradient angle, in degrees. */
  angle: 105,
  /** Length of one pass, in milliseconds. */
  sweepDuration: 1600,
  /** Cycle length, in milliseconds — one pass, then rest until the next. */
  idleInterval: 7000,
  /** Alignment of the wireframe over the photo. */
  wireframeOffset: { x: 0, y: 0, scale: 1 } as WireframeOffset,
};

/**
 * `data-helmet-scan` values. The layers tag their nodes with these instead of
 * receiving refs, so the sweep can find them from a single container ref.
 */
export const SCAN_NODE = {
  photo: 'photo',
  wire: 'wire',
  edge: 'edge',
} as const;
