/**
 * Sponsors and partners.
 *
 * Two renderings share this data:
 * - the hero marquee (logos in their own colourways, `marqueeClass` handles
 *   per-logo inversion and sizing),
 * - the Partners grid (every logo white, via a CSS filter — see `gridClass`).
 *
 * `emptySlots` is the number of dashed "YOUR BRAND HERE" cells — the section
 * doubles as a sponsorship pitch.
 *
 * NOTE: gelbura's source logo (316821634_*.jpg) is a white-background JPEG;
 * the derived transparent crop is used instead. Swap in a real SVG when one
 * turns up.
 */

export interface Partner {
  id: string;
  name: string;
  /**
   * Path under /public. For a raster, the original: <Picture> serves the AVIF
   * and WebP that `pnpm images` writes beside it, and falls back to this.
   */
  logoSrc: string;
  /** Alt text — required, never decorative. */
  logoAlt: string;
  /**
   * The file's own pixel dimensions, rendered as `width`/`height` attributes.
   *
   * Both renderings set height in CSS and leave width `auto`, so these only
   * supply the aspect ratio — but they supply it *before the image decodes*,
   * which matters: the hero marquee measures its own content to decide how many
   * copies it needs to cover the bar, and an image with no intrinsic size
   * measures zero. They also stop the strip shifting as the logos land.
   *
   * They describe the AVIF and WebP encodes too, which `pnpm images` writes at
   * the original's exact size and a test holds there.
   */
  intrinsicWidth: number;
  intrinsicHeight: number;
  /** Logo height in the hero marquee, px. */
  marqueeHeight: number;
  /** Logo height in the Partners grid, px. */
  gridHeight: number;
  /** Extra classes in the marquee (inversion, opacity). */
  marqueeClass?: string;
  /**
   * The filter that makes the logo white in the Partners grid. Defaults to
   * `brightness-0 invert`, which flattens every opaque pixel to white — right
   * for a one-colour wordmark, wrong for a logo with a cut-out in it.
   */
  gridClass?: string;
}

export const partners: Partner[] = [
  {
    id: 'gelbura',
    name: 'gelbura',
    logoSrc: '/images/partners/gelbura.png',
    logoAlt: 'gelbura',
    intrinsicWidth: 178,
    intrinsicHeight: 63,
    marqueeHeight: 22,
    gridHeight: 34,
    marqueeClass: 'opacity-90',
  },
  {
    id: 'spardox',
    name: 'SPARDOX',
    logoSrc: '/images/partners/spardox.png',
    logoAlt: 'SPARDOX',
    intrinsicWidth: 500,
    intrinsicHeight: 167,
    marqueeHeight: 17,
    gridHeight: 26,
    marqueeClass: 'invert opacity-85',
  },
  {
    id: 'drivehunter',
    name: 'drivehunter',
    logoSrc: '/images/partners/drivehunter.svg',
    logoAlt: 'drivehunter',
    intrinsicWidth: 360,
    intrinsicHeight: 80,
    marqueeHeight: 23,
    gridHeight: 32,
    marqueeClass: 'opacity-85',
    // The icon is a green tile with black bars in it, and the default filter
    // turned both white: a blank square. Greyscale then brightness pushes the
    // green (luminance ~0.65) and the white wordmark to white and leaves the
    // bars black, so they still read as a chart knocked out of the tile.
    gridClass: 'grayscale brightness-[1.6]',
  },
  {
    id: 'tch',
    name: 'Team Curve Hunters',
    logoSrc: '/images/partners/tch.png',
    logoAlt: 'Team Curve Hunters',
    intrinsicWidth: 256,
    intrinsicHeight: 75,
    marqueeHeight: 27,
    gridHeight: 40,
    marqueeClass: 'opacity-90',
  },
];

/** Dashed "YOUR BRAND HERE" cells in the Partners grid. */
export const emptySlots = 2;
