/**
 * Follower / viewership figures for the Content section.
 *
 * These are snapshot values, entered by hand. There is no API integration and
 * none is planned — a live fetch would need a server-side token, which this
 * static site deliberately does not have.
 *
 * TODO: replace with real figures and set `updatedAt`.
 */

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'twitch';

export interface SocialStat {
  platform: SocialPlatform;
  /** Display handle, e.g. "@handle". */
  handle: string;
  href: string;
  /** Followers / subscribers at the time of the snapshot. */
  followers: number;
  /** Total views, where the platform reports one. */
  totalViews: number | null;
}

/** ISO date of the last manual refresh. Empty until first filled in. */
export const socialStatsUpdatedAt = '';

export const socialStats: SocialStat[] = [
  // TODO: real entries.
];
