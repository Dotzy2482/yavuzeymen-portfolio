/**
 * Configuration for the hero's helmet reveal — the one file to edit when tuning
 * the effect.
 *
 * The hero stacks two photographs of the same frame: Yavuz bare-headed, and the
 * identical pose with the helmet on. They were shot to the same 1323×1189 box
 * and the bodies line up pixel for pixel, so the top layer needs no fitting at
 * all — only a mask. Bringing the cursor near the head opens a soft-edged circle
 * in that mask and the helmet shows through inside it.
 *
 * This file lives apart from both the hook and the component on purpose: the
 * component file may only export components (Fast Refresh), and putting the
 * numbers next to the hook would bury the tuning in code that never reads it.
 *
 * The effect itself is in `useHelmetReveal.ts`; the layers are in
 * `HeroPortrait.tsx`.
 */

/**
 * The originals. Both are PNG for their alpha; <Picture> serves the AVIF or
 * WebP encodes `pnpm images` writes beside them, which keep the alpha and the
 * pixel size.
 */
export const FACE_PHOTO = '/images/hero/portrait-cutout.png';
export const HELMET_PHOTO = '/images/hero/portrait-helmet.png';

/**
 * Intrinsic size of both photos, so each layer reserves its box before load.
 * They must stay identical: the reveal assumes the two frames are the same
 * crop, and any divergence shows up as the body jumping under the circle. The
 * encodes share it — the image test fails if either is ever written at any
 * other size.
 */
export const PORTRAIT_W = 1323;
export const PORTRAIT_H = 1189;

/** Every tunable of the effect. */
export const HELMET_REVEAL = {
  /**
   * Centre of the head in the photo, as fractions of its width and height —
   * measured from where the two frames actually differ, not eyeballed.
   */
  head: { x: 0.504, y: 0.18 },

  /**
   * Spotlight radius, as a fraction of the *rendered* portrait's height. `max`
   * is a little wider than the helmet itself, so a cursor parked on the visor
   * shows the whole shell; it shrinks towards `min` as the cursor drifts off.
   */
  radius: { min: 0.1, max: 0.23 },

  /**
   * How much of the circle is fully opaque before the falloff starts, as a
   * fraction of the radius. The rest is the soft edge — this is the blur.
   */
  core: 0.45,

  /**
   * Cursor distance from the head at which the reveal is fully open (`near`)
   * and fully closed (`far`), in rendered portrait heights. Between them it
   * ramps linearly.
   */
  near: 0.15,
  far: 0.42,

  /**
   * Response time constants, in milliseconds — the circle trails the cursor
   * rather than snapping to it, and opens more slowly than it follows.
   */
  followTau: 80,
  openTau: 130,

  /**
   * Below `md` there is no cursor, so the pinned hero's scroll drives the
   * effect instead: the circle starts wide enough to hold the whole helmet —
   * which reads as the helmet simply being on — and irises shut onto the head
   * as you scroll. `scrubRadius` is that starting radius, again in rendered
   * heights.
   *
   * It only has to cover the *head*, not the frame: below the neck the two
   * photos are the same exposure of the same pose, so a mask edge crossing the
   * shoulders has nothing to reveal and cannot be seen. Sizing it to the frame
   * instead spends most of the scroll on a circle whose edge is off-screen.
   */
  scrubRadius: 1,
  /** Pin progress at which the helmet has fully dissolved. */
  scrubEnd: 0.55,

  /**
   * Fraction of the stage that may scroll off the top before the reveal is
   * gone. Desktop only — the pinned mobile stage never moves.
   */
  fadeViewport: 0.5,
} as const;
