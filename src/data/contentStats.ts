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
  /** Cyan figure on the card — an Instagram reel's real view count. */
  stat?: string;
  /** The post this card is, when it is one: the card links to it. */
  href?: string;
}

/**
 * The playlist, in order. Five of Yavuz's most-watched Instagram reels (from
 * 797K views down; the 247K one is age-restricted and cannot be fetched, so
 * the 152K Monza reel stands in) alternate with five clips of his own
 * footage. Each reel card is a ~9 s cut of the reel and links to it; the
 * footage cards link nowhere. `FAN_CENTER_INDEX` is the card the fan opens
 * on, in the centre slot; the mobile carousel leads with it too.
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
    id: 'ig-hayat-bitti',
    caption: 'HAYAT BİTTİ',
    src: '/images/reels/ig-hayat-bitti.jpg',
    video: '/videos/reels/ig-hayat-bitti.mp4',
    preview: '/videos/reels/preview/ig-hayat-bitti.mp4',
    stat: '482K',
    href: 'https://www.instagram.com/reel/C3AQQy2Nstg/',
  },
  {
    id: 'ig-takip-hocam',
    caption: 'TAKİP HOCAM',
    src: '/images/reels/ig-takip-hocam.jpg',
    video: '/videos/reels/ig-takip-hocam.mp4',
    preview: '/videos/reels/preview/ig-takip-hocam.mp4',
    stat: '797K',
    href: 'https://www.instagram.com/reel/DAG2tZJN-7F/',
  },
  {
    id: 'rig',
    caption: 'SIM RIG',
    src: '/images/reels/rig.jpg',
    video: '/videos/reels/rig.mp4',
    preview: '/videos/reels/preview/rig.mp4',
  },
  {
    id: 'ig-takip-etsenize',
    caption: 'TAKİP ETSENİZE',
    src: '/images/reels/ig-takip-etsenize.jpg',
    video: '/videos/reels/ig-takip-etsenize.mp4',
    preview: '/videos/reels/preview/ig-takip-etsenize.mp4',
    stat: '378K',
    href: 'https://www.instagram.com/reel/C3w6-ZqtD7W/',
  },
  {
    id: 'fiat',
    caption: 'FIAT EGEA',
    src: '/images/reels/fiat.jpg',
    video: '/videos/reels/fiat.mp4',
    preview: '/videos/reels/preview/fiat.mp4',
  },
  {
    id: 'ig-eau-rouge',
    caption: 'EAU ROUGE',
    src: '/images/reels/ig-eau-rouge.jpg',
    video: '/videos/reels/ig-eau-rouge.mp4',
    preview: '/videos/reels/preview/ig-eau-rouge.mp4',
    stat: '177K',
    href: 'https://www.instagram.com/reel/C4XWnqmNQM9/',
  },
  {
    id: 'bts',
    caption: 'BEHIND THE SCENES',
    src: '/images/reels/bts.jpg',
    video: '/videos/reels/bts.mp4',
    preview: '/videos/reels/preview/bts.mp4',
  },
  {
    id: 'ig-monza',
    caption: 'MONZA',
    src: '/images/reels/ig-monza.jpg',
    video: '/videos/reels/ig-monza.mp4',
    preview: '/videos/reels/preview/ig-monza.mp4',
    stat: '152K',
    href: 'https://www.instagram.com/reel/C3ouh14NwdR/',
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
