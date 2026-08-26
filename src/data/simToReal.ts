/**
 * The Sim to Real gallery, ordered sim → real: rig, TOSFED paddock, pit pass,
 * FIAT Egea, race crop, and the empty karting slot (photo to come).
 *
 * Desktop heights come straight from the design's varied-height photo row;
 * `mobileHidden` drops an item from the stacked mobile list (the mobile
 * design omits the pit-pass shot).
 *
 * The intrinsic sizes matter more than they look. On desktop each photo is
 * given a height and left to work its own width out, and the pinned gallery
 * measures the row to decide how far to scrub it. Without intrinsic dimensions
 * that measurement happens against zero-width images and the row scrubs the
 * wrong distance, so the gallery never lands flush. They also stop the row
 * reflowing as the photos decode.
 */

export interface SimToRealItem {
  id: string;
  /** Mono label above the photo. */
  label: string;
  /** Cyan label — only the SIMULATOR starting point. */
  accent: boolean;
  /** Path under /public; null renders the dashed empty slot. */
  src: string | null;
  alt: string;
  /** The file's own pixel size. Null only for the empty slot, which has no file. */
  intrinsicWidth: number | null;
  intrinsicHeight: number | null;
  /** Desktop CSS height, e.g. 'min(48vh, 440px)'. */
  height: string;
  /** Width for the empty slot (images size themselves). */
  width?: string;
  mobileHidden?: boolean;
}

export const simToRealItems: SimToRealItem[] = [
  {
    id: 'simulator',
    label: 'SIMULATOR',
    accent: true,
    src: '/images/simtoreal/rig.png',
    intrinsicWidth: 433,
    intrinsicHeight: 545,
    alt: 'Sim rig',
    height: 'min(48vh, 440px)',
  },
  {
    id: 'paddock',
    label: 'TOSFED — PADDOCK',
    accent: false,
    src: '/images/simtoreal/paddock.jpg',
    intrinsicWidth: 348,
    intrinsicHeight: 407,
    alt: 'TOSFED paddock',
    height: 'min(42vh, 390px)',
  },
  {
    id: 'pit-pass',
    label: 'TOSFED — PIT PASS',
    accent: false,
    src: '/images/simtoreal/pit-pass.jpg',
    intrinsicWidth: 1200,
    intrinsicHeight: 1600,
    alt: 'TOSFED pit pass',
    height: 'min(52vh, 470px)',
    mobileHidden: true,
  },
  {
    id: 'fiat-egea',
    label: 'FIAT EGEA',
    accent: false,
    src: '/images/simtoreal/fiat-egea.jpg',
    intrinsicWidth: 1600,
    intrinsicHeight: 1066,
    alt: 'FIAT Egea',
    height: 'min(44vh, 400px)',
  },
  {
    id: 'fiat-race',
    label: 'FIAT EGEA — RACE',
    accent: false,
    src: '/images/simtoreal/fiat-front.png',
    intrinsicWidth: 828,
    intrinsicHeight: 788,
    alt: 'FIAT Egea yarış',
    height: 'min(48vh, 440px)',
  },
  {
    id: 'karting',
    label: 'KARTING',
    accent: false,
    src: null,
    intrinsicWidth: null,
    intrinsicHeight: null,
    alt: 'Karting fotoğrafı yakında',
    height: 'min(44vh, 400px)',
    width: 'min(34vh, 320px)',
  },
];
