/**
 * Sim rig hardware — the technical-document list of the Setup section.
 *
 * Yavuz's own list: the wheel and base, and the pedals. He asked for those two
 * rows and nothing else, so the rig, display and PC rows the handoff reserved
 * are gone rather than left as placeholders. `placeholder: true` would render a
 * row's value as a dashed reserved slot (see SpecRow); none needs it now.
 */

export interface SetupItem {
  id: string;
  /** Mono component label, e.g. "STEERING WHEEL". */
  label: string;
  /** Bold value on the right. */
  value: string;
  /** Renders the value dimmed until the real model is filled in. */
  placeholder: boolean;
}

export const setupItems: SetupItem[] = [
  { id: 'wheel', label: 'WHEEL & BASE', value: 'LOGITECH G29', placeholder: false },
  { id: 'pedals', label: 'PEDALS', value: 'MOZA SRP — LOAD CELL', placeholder: false },
];
