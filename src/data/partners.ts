/**
 * Sponsors and partners.
 *
 * Rendered by the Partners section as a logo wall.
 *
 * NOTE: logo files go in `public/images/partners/`. Do not commit a logo
 * before its usage rights are confirmed — `public/images/private/` is
 * git-ignored and is the holding area for anything unresolved.
 *
 * TODO: replace with the real partner list.
 */

export type PartnerTier = 'primary' | 'technical' | 'supporting';

export interface Partner {
  id: string;
  name: string;
  tier: PartnerTier;
  /** Path under /public, or empty until the asset is cleared for use. */
  logoSrc: string;
  /** Alt text — required, never decorative. */
  logoAlt: string;
  href: string;
}

export const partners: Partner[] = [
  // TODO: real entries.
];
