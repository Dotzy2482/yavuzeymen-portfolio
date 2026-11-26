/**
 * Sim rig hardware — the technical-document list of the Setup section, and
 * the numbered markers that tie it to the photo of the rig beside it.
 *
 * November 2026, from Yavuz: the wheel and pedals first (he named those two),
 * then the PC as his system information reports it. The displays are read off
 * the photo — the brand is printed on each bezel — and the sim is the one his
 * records come from. `placeholder: true` would render a row's value as a
 * dashed reserved slot (see SpecRow); none needs it.
 *
 * Markers sit on public/images/setup/desk.jpg, in percent of the photo's width
 * and height, so they stay on their object at every size the photo is drawn.
 * Re-crop the photo and they have to be re-placed.
 */

export interface SetupMarker {
  /** Two-digit number shown on the photo and beside the rows it belongs to. */
  n: string;
  /** Position on the photo, in percent of its width and height. */
  x: number;
  y: number;
  /** What the marker points at, for screen readers. */
  label: string;
}

export const setupMarkers: SetupMarker[] = [
  { n: '01', x: 75, y: 58, label: 'Direksiyon' },
  { n: '02', x: 45, y: 86, label: 'Pedallar' },
  { n: '03', x: 43, y: 41, label: 'Ekranlar' },
  { n: '04', x: 71, y: 79, label: 'Bilgisayar' },
];

export interface SetupItem {
  id: string;
  /** Mono component label, e.g. "WHEEL & BASE". */
  label: string;
  /** Bold value on the right. */
  value: string;
  /** Renders the value dimmed until the real model is filled in. */
  placeholder: boolean;
  /** The photo marker this row belongs to, if the photo shows it. */
  marker?: string;
}

export const setupItems: SetupItem[] = [
  {
    id: 'wheel',
    label: 'WHEEL & BASE',
    value: 'LOGITECH G29',
    placeholder: false,
    marker: '01',
  },
  {
    id: 'pedals',
    label: 'PEDALS',
    value: 'MOZA SRP — LOAD CELL',
    placeholder: false,
    marker: '02',
  },
  {
    id: 'displays',
    label: 'DISPLAYS',
    value: 'ASUS + PHILIPS',
    placeholder: false,
    marker: '03',
  },
  {
    id: 'cpu',
    label: 'PROCESSOR',
    value: 'AMD RYZEN 5 5600',
    placeholder: false,
    marker: '04',
  },
  {
    id: 'gpu',
    label: 'GRAPHICS',
    value: 'RADEON RX 6700 XT 12 GB',
    placeholder: false,
    marker: '04',
  },
  { id: 'ram', label: 'MEMORY', value: '16 GB', placeholder: false, marker: '04' },
  { id: 'sim', label: 'SIM', value: 'IRACING', placeholder: false },
];
