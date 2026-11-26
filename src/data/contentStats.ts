/**
 * The Content section's data: three headline counters and the five reel
 * cards of the fan/carousel.
 *
 * The counters are a snapshot of Yavuz's public profiles, read on 27 November
 * 2026: @yavuzeymen_12 on Instagram (1,344 followers; best reel 7,810 views)
 * and on TikTok (7,224 likes; best video 8,920 views). They replaced the
 * handoff's illustrative figures (146.848 views, a 797K reel), which were
 * never his. There is no live fetch: both platforms need an approved app and
 * a server-side token for that, which this static site does not have — so
 * refresh them by hand, and keep the date above honest.
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
    id: 'instagram-followers',
    value: 1_344,
    decimals: 0,
    label: 'INSTAGRAM TAKİPÇİ',
    accent: false,
  },
  {
    id: 'top-video',
    value: 8_920,
    decimals: 0,
    label: 'EN ÇOK İZLENEN VİDEO',
    accent: true,
  },
  {
    id: 'tiktok-likes',
    value: 7_224,
    decimals: 0,
    label: 'TIKTOK BEĞENİ',
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
