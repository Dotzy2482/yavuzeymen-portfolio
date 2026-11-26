/**
 * The Content section's data: three headline counters and the five reel
 * cards of the fan/carousel.
 *
 * The counters are Instagram, his main platform: @yavuzeymen_12's reels, all
 * 346 of them, read signed in on 27 November 2026. His best reel has 797,000
 * views (the handoff's 797K was right), nine have passed 100,000, and the
 * reels add up to about five million views — "about", because Instagram
 * rounds every count past ten thousand ("84,6 B"), so the total is stated as
 * a floor. A signed-out visitor sees only the latest twelve reels, which is
 * how an earlier version of this file came to claim 7,810. There is no live
 * fetch: that needs an approved Meta app and a server-side token, which this
 * static site does not have — refresh by hand, signed in, and keep the date
 * above honest.
 */

export interface ContentCounter {
  id: string;
  value: number;
  /** Decimal places (82.3 → "%82,3"). */
  decimals: number;
  prefix?: string;
  /** Shown after the number, e.g. `+` for a floor. */
  suffix?: string;
  label: string;
  accent: boolean;
}

export const contentCounters: ContentCounter[] = [
  {
    id: 'reel-views',
    value: 5_000_000,
    decimals: 0,
    suffix: '+',
    label: 'TOPLAM REEL İZLENMESİ',
    accent: false,
  },
  {
    id: 'top-reel',
    value: 797_000,
    decimals: 0,
    label: 'EN ÇOK İZLENEN REEL',
    accent: true,
  },
  {
    id: 'reels-over-100k',
    value: 9,
    decimals: 0,
    label: '100 BİN ÜSTÜ İZLENEN REEL',
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
  /**
   * The same clip at 270 × 480 and 24 fps (120–200 KB): what the fan's side
   * cards loop, so four of them cost about what one full clip does to decode.
   */
  preview?: string;
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
    caption: 'PADDOCK',
    src: '/images/reels/paddock.jpg',
    video: '/videos/reels/paddock.mp4',
    preview: '/videos/reels/preview/paddock.mp4',
  },
  {
    id: 'rig',
    caption: 'SIM RIG',
    src: '/images/reels/rig.jpg',
    video: '/videos/reels/rig.mp4',
    preview: '/videos/reels/preview/rig.mp4',
  },
  {
    id: 'fiat',
    caption: 'FIAT EGEA',
    src: '/images/reels/fiat.jpg',
    video: '/videos/reels/fiat.mp4',
    preview: '/videos/reels/preview/fiat.mp4',
  },
  {
    id: 'bts',
    caption: 'BEHIND THE SCENES',
    src: '/images/reels/bts.jpg',
    video: '/videos/reels/bts.mp4',
    preview: '/videos/reels/preview/bts.mp4',
  },
  {
    id: 'race-day',
    caption: 'ONBOARD',
    src: '/images/reels/race-day.jpg',
    video: '/videos/reels/race-day.mp4',
    preview: '/videos/reels/preview/race-day.mp4',
  },
];

export const FAN_CENTER_INDEX = 2;
