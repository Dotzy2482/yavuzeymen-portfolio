/**
 * Sponsors and partners.
 *
 * Two renderings share this data:
 * - the hero marquee (logos in their own colourways, `marqueeClass` handles
 *   per-logo inversion and sizing),
 * - the Partners grid (every logo forced pure white via CSS filter).
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
  /** Path under /public. */
  logoSrc: string;
  /** PNG fallback for non-AVIF browsers; rendered via <picture>. */
  logoFallbackSrc?: string;
  /** Alt text — required, never decorative. */
  logoAlt: string;
  /** Logo height in the hero marquee, px. */
  marqueeHeight: number;
  /** Logo height in the Partners grid, px. */
  gridHeight: number;
  /** Extra classes in the marquee (inversion, opacity). */
  marqueeClass?: string;
}

export const partners: Partner[] = [
  {
    id: 'gelbura',
    name: 'gelbura',
    logoSrc: '/images/partners/gelbura.png',
    logoAlt: 'gelbura',
    marqueeHeight: 22,
    gridHeight: 34,
    marqueeClass: 'opacity-90',
  },
  {
    id: 'spardox',
    name: 'SPARDOX',
    logoSrc: '/images/partners/spardox.png',
    logoAlt: 'SPARDOX',
    marqueeHeight: 17,
    gridHeight: 26,
    marqueeClass: 'invert opacity-85',
  },
  {
    id: 'drivehunter',
    name: 'drivehunter',
    logoSrc: '/images/partners/drivehunter.svg',
    logoAlt: 'drivehunter',
    marqueeHeight: 23,
    gridHeight: 32,
    marqueeClass: 'opacity-85',
  },
  {
    id: 'tch',
    name: 'Team Curve Hunters',
    logoSrc: '/images/partners/tch.avif',
    logoFallbackSrc: '/images/partners/tch.png',
    logoAlt: 'Team Curve Hunters',
    marqueeHeight: 27,
    gridHeight: 40,
    marqueeClass: 'opacity-90',
  },
];

/** Dashed "YOUR BRAND HERE" cells in the Partners grid. */
export const emptySlots = 2;
