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
  /** Cyan figure on the card, e.g. a real view count; none of the cards uses it now. */
  stat?: string;
  /** The post this card is, when it is one: the card links to it. */
  href?: string;
}

/**
 * The playlist, in order. Four Instagram reels Yavuz chose himself — his
 * iRacing work with a facecam — alternate with five clips of his own
 * footage. Each reel card is a ~9 s cut of the reel and links to it,
 * with no view count: he picked these for how they look, not how they did.
 * The footage cards link nowhere. `FAN_CENTER_INDEX` is the card the fan
 * opens on, in the centre slot; the mobile carousel leads with it too.
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
    id: 'ig-atak',
    caption: 'ATAK',
    src: '/images/reels/ig-atak.jpg',
    video: '/videos/reels/ig-atak.mp4',
    preview: '/videos/reels/preview/ig-atak.mp4',
    href: 'https://www.instagram.com/p/De02mEGtNKC/',
  },
  {
    id: 'ig-merhaba',
    caption: 'MERHABA, BEN YAVUZ',
    src: '/images/reels/ig-merhaba.jpg',
    video: '/videos/reels/ig-merhaba.mp4',
    preview: '/videos/reels/preview/ig-merhaba.mp4',
    href: 'https://www.instagram.com/p/DdRozgKsxF1/',
  },
  {
    id: 'rig',
    caption: 'SIM RIG',
    src: '/images/reels/rig.jpg',
    video: '/videos/reels/rig.mp4',
    preview: '/videos/reels/preview/rig.mp4',
  },
  {
    id: 'ig-kevin-estre',
    caption: 'LIKE A KEVIN ESTRE',
    src: '/images/reels/ig-kevin-estre.jpg',
    video: '/videos/reels/ig-kevin-estre.mp4',
    preview: '/videos/reels/preview/ig-kevin-estre.mp4',
    href: 'https://www.instagram.com/p/De3m1Y9NyVG/',
  },
  {
    id: 'fiat',
    caption: 'FIAT EGEA',
    src: '/images/reels/fiat.jpg',
    video: '/videos/reels/fiat.mp4',
    preview: '/videos/reels/preview/fiat.mp4',
  },
  {
    id: 'ig-estre-atagi',
    caption: 'ESTRE ATAĞI',
    src: '/images/reels/ig-estre-atagi.jpg',
    video: '/videos/reels/ig-estre-atagi.mp4',
    preview: '/videos/reels/preview/ig-estre-atagi.mp4',
    href: 'https://www.instagram.com/p/DfxU3XZxPLR/',
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
