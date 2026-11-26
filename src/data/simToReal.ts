/**
 * The Sim to Real gallery, ordered sim → real: rig, TOSFED paddock, pit pass,
 * FIAT Egea, the Egea racing, and karting.
 *
 * November 2026: the low-resolution working copies were replaced from the
 * originals Yavuz supplied — the rig and the Egea at full resolution from the
 * shots they had been cut from, the paddock as his own portrait in the TOSFED
 * paddock, the race crop as a professional action shot instead of a phone
 * screenshot of a broadcast, and the karting slot finally filled.
 *
 * From `md` up the photos sit in a grid that reads left to right, top to
 * bottom (see SimToReal): two columns on a tablet, then twelve tracks from
 * `lg`, three portraits over a wide shot and two tall ones. `cell` places an
 * item on that grid and `frame` shapes its photo, which is cropped to fill it.
 * `focus` is the crop's anchor where the centre would cut the subject.
 * `mobileHidden` drops an item from the stacked mobile list (the mobile design
 * omits the pit-pass shot).
 *
 * The intrinsic sizes give each photo its aspect ratio before it decodes, so
 * the phone stack does not reflow as the images land.
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
  /** Grid placement from `md` up (column span on the `lg` grid). */
  cell: string;
  /** The photo frame's shape from `md` up. */
  frame: string;
  /** `object-position` for the crop, when the centre is the wrong anchor. */
  focus?: string;
  mobileHidden?: boolean;
}

export const simToRealItems: SimToRealItem[] = [
  {
    id: 'simulator',
    label: 'SIMULATOR',
    accent: true,
    src: '/images/simtoreal/rig.jpg',
    intrinsicWidth: 1600,
    intrinsicHeight: 2000,
    alt: 'Yavuz Eymen, FIAT standındaki simülatörde',
    cell: 'lg:col-span-4',
    frame: 'aspect-[4/5] lg:aspect-auto lg:h-[clamp(340px,30vw,480px)]',
  },
  {
    id: 'paddock',
    label: 'TOSFED — PADDOCK',
    accent: false,
    src: '/images/simtoreal/paddock.jpg',
    intrinsicWidth: 1600,
    intrinsicHeight: 2000,
    alt: 'Yavuz Eymen, TOSFED akreditasyonuyla padokta',
    cell: 'lg:col-span-4',
    frame: 'aspect-[4/5] lg:aspect-auto lg:h-[clamp(340px,30vw,480px)]',
  },
  {
    id: 'pit-pass',
    label: 'TOSFED — PIT PASS',
    accent: false,
    src: '/images/simtoreal/pit-pass.jpg',
    intrinsicWidth: 1200,
    intrinsicHeight: 1600,
    alt: 'TOSFED pit pass',
    cell: 'lg:col-span-4',
    frame: 'aspect-[4/5] lg:aspect-auto lg:h-[clamp(340px,30vw,480px)]',
    mobileHidden: true,
  },
  {
    id: 'fiat-egea',
    label: 'FIAT EGEA',
    accent: false,
    src: '/images/simtoreal/fiat-egea.jpg',
    intrinsicWidth: 2400,
    intrinsicHeight: 1601,
    alt: 'FIAT Egea',
    cell: 'lg:col-span-6',
    frame: 'aspect-[4/5] lg:aspect-auto lg:h-[clamp(280px,24vw,400px)]',
    focus: '60% 55%',
  },
  {
    id: 'fiat-race',
    label: 'FIAT EGEA — RACE',
    accent: false,
    src: '/images/simtoreal/fiat-race.jpg',
    intrinsicWidth: 2400,
    intrinsicHeight: 1601,
    alt: 'FIAT Egea yarış aracı pistte, virajdan toz kaldırarak çıkıyor',
    cell: 'lg:col-span-3',
    frame: 'aspect-[4/5] lg:aspect-auto lg:h-[clamp(280px,24vw,400px)]',
    focus: '56% 60%',
  },
  {
    id: 'karting',
    label: 'KARTING',
    accent: false,
    src: '/images/simtoreal/karting.jpg',
    intrinsicWidth: 1600,
    intrinsicHeight: 2000,
    alt: 'Yavuz Eymen, yarış tulumuyla 37 numaralı kartının yanında',
    cell: 'lg:col-span-3',
    frame: 'aspect-[4/5] lg:aspect-auto lg:h-[clamp(280px,24vw,400px)]',
  },
];
