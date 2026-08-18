/**
 * Sim rig hardware — the technical-document list of the Setup section.
 *
 * All values are explicit placeholders per the handoff ("MODEL — YER
 * TUTUCU"); real models are still to come. `placeholder: false` once a row
 * has its real value, which switches the text from 45% white to full white.
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
  { id: 'wheel', label: 'STEERING WHEEL', value: 'MODEL — YER TUTUCU', placeholder: true },
  { id: 'pedals', label: 'PEDALS', value: 'MODEL — YER TUTUCU', placeholder: true },
  { id: 'rig', label: 'RIG & SEAT', value: 'MODEL — YER TUTUCU', placeholder: true },
  { id: 'display', label: 'DISPLAY', value: 'MODEL — YER TUTUCU', placeholder: true },
  { id: 'pc', label: 'PC', value: 'MODEL — YER TUTUCU', placeholder: true },
];
