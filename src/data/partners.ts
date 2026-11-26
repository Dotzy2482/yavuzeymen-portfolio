/**
 * Yavuz's partners — today, his team alone.
 *
 * gelbura, SPARDOX and DriveHunter used to be listed here too, but they
 * sponsor Team Curve Hunters, not Yavuz, and presenting them as his would be
 * a claim the site cannot make. They were removed with their logo files
 * (November 2026); git history has them should one become his own.
 *
 * The Partners section is built for a short list: each partner is a feature
 * card, logo in its own colours. There are no empty "YOUR BRAND HERE" cells
 * any more — a single quiet line under the cards makes that pitch instead.
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
   * The file's own pixel dimensions, rendered as `width`/`height` attributes so
   * the card holds its shape before the logo decodes. They describe the AVIF
   * and WebP encodes too, which `pnpm images` writes at the original's size.
   */
  intrinsicWidth: number;
  intrinsicHeight: number;
  /** What the partner is to Yavuz — a mono kicker, English. */
  kind: string;
  /** One line about the partnership — body copy, Turkish. */
  note: string;
}

export const partners: Partner[] = [
  {
    id: 'tch',
    name: 'Team Curve Hunters',
    logoSrc: '/images/partners/tch.png',
    logoAlt: 'Team Curve Hunters',
    intrinsicWidth: 256,
    intrinsicHeight: 75,
    kind: 'TEAM',
    // Both halves come from the career timeline (2023 and 2024 entries).
    note: "2024'ten bu yana takımın ana kadrosundayım; uluslararası GT3 organizasyonlarında takımla yarışıyorum.",
  },
];
