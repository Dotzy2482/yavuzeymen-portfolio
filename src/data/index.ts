/**
 * Barrel for the static content layer.
 *
 * Track data is intentionally absent: it belongs to the track-records feature
 * and is reachable only through that module's public API.
 */

export { profile, socialLinks } from './profile';
export type { Profile, HeroStat } from './profile';

export { career, careerRange } from './career';
export type { CareerEntry } from './career';

export { achievements } from './achievements';
export type { Achievement } from './achievements';

export { partners, emptySlots } from './partners';
export type { Partner } from './partners';

export { contentCounters, reelCards, FAN_CENTER_INDEX } from './contentStats';
export type { ContentCounter, ReelCard } from './contentStats';

export { simToRealItems } from './simToReal';
export type { SimToRealItem } from './simToReal';

export { setupItems } from './setup';
export type { SetupItem } from './setup';
