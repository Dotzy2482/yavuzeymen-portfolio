/**
 * Barrel for the static content layer.
 *
 * Track data is intentionally absent: it belongs to the track-records feature
 * and is reachable only through that module's public API.
 */

export { profile } from './profile';
export type { Profile } from './profile';

export { career } from './career';
export type { CareerEntry } from './career';

export { achievements, achievementTotals } from './achievements';
export type { Achievement, AchievementKind } from './achievements';

export { partners } from './partners';
export type { Partner, PartnerTier } from './partners';

export { socialStats, socialStatsUpdatedAt } from './socialStats';
export type { SocialStat, SocialPlatform } from './socialStats';

export { setupItems, SETUP_CATEGORY_ORDER } from './setup';
export type { SetupItem, SetupCategory } from './setup';
