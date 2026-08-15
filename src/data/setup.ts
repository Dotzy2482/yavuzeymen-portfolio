/**
 * Sim rig hardware and the software stack.
 *
 * Rendered by the Setup section, grouped by category.
 *
 * TODO: replace with the real rig.
 */

export type SetupCategory =
  'wheelbase' | 'wheel' | 'pedals' | 'shifter' | 'rig' | 'display' | 'audio' | 'pc' | 'software';

export interface SetupItem {
  id: string;
  category: SetupCategory;
  brand: string;
  model: string;
  /** One line on why this part is in the rig. */
  note: string;
}

/** Display order and labels for the category groups. */
export const SETUP_CATEGORY_ORDER: readonly SetupCategory[] = [
  'wheelbase',
  'wheel',
  'pedals',
  'shifter',
  'rig',
  'display',
  'audio',
  'pc',
  'software',
];

export const setupItems: SetupItem[] = [
  // TODO: real entries.
];
