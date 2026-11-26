/**
 * The Content section's data: three headline counters and the five reel
 * cards of the fan/carousel.
 *
 * These are snapshot values, entered by hand. There is no API integration and
 * none is planned — a live fetch would need a server-side token, which this
 * static site deliberately does not have.
 */

export interface ContentCounter {
  id: string;
  value: number;
  /** Decimal places (82.3 → "%82,3"). */
  decimals: number;
  prefix?: string;
  label: string;
  accent: boolean;
}

export const contentCounters: ContentCounter[] = [
  {
    id: 'views-90d',
    value: 146_848,
    decimals: 0,
    label: 'SON 90 GÜNDE GÖRÜNTÜLENME',
    accent: false,
  },
  {
    id: 'top-reel',
    value: 797_000,
    decimals: 0,
    label: 'EN YÜKSEK REEL İZLENMESİ',
    accent: true,
  },
  {
    id: 'reels-share',
    value: 82.3,
    decimals: 1,
    prefix: '%',
    label: 'REELS AĞIRLIĞI',
    accent: false,
  },
];

export interface ReelCard {
  id: string;
  caption: string;
  /**
   * The card's still: the poster frame of its clip, and all a visitor sees
   * under reduced motion or before the clip has loaded.
   */
  src: string;
  /**
   * A short muted loop (540 × 960 H.264, about 7 s) cut from Yavuz's own
   * footage; it plays only while the card is on screen. See PhotoCard.
   */
  video?: string;
  /** Cyan view-count shown on the emphasised card. */
  stat?: string;
}

/**
 * Desktop fan order, outer-left → outer-right; `FAN_CENTER_INDEX` is the flat
 * emphasised card. The mobile carousel leads with the centre card.
 */
export const reelCards: ReelCard[] = [
  {
    id: 'paddock',
    caption: 'REEL — PADDOCK',
    src: '/images/reels/paddock.jpg',
    video: '/videos/reels/paddock.mp4',
  },
  {
    id: 'rig',
    caption: 'REEL — SIM RIG',
    src: '/images/reels/rig.jpg',
    video: '/videos/reels/rig.mp4',
  },
  {
    id: 'fiat',
    caption: 'REEL — FIAT EGEA',
    src: '/images/reels/fiat.jpg',
    video: '/videos/reels/fiat.mp4',
    stat: '797K',
  },
  {
    id: 'bts',
    caption: 'REEL — BEHIND THE SCENES',
    src: '/images/reels/bts.jpg',
    video: '/videos/reels/bts.mp4',
  },
  {
    id: 'race-day',
    caption: 'REEL — ONBOARD',
    src: '/images/reels/race-day.jpg',
    video: '/videos/reels/race-day.mp4',
  },
];

export const FAN_CENTER_INDEX = 2;
