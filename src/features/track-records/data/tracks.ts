/**
 * Placeholder track data.
 *
 * Three records exist only so the list, panel and filters have something to
 * render. Every geometric and timing field is a stand-in.
 *
 * TODO: author the real `svgPath` outlines (single closed subpath each) and
 *       set the matching `viewBox`.
 * TODO: enter the real lap times and sector splits.
 * TODO: measure `startFinishOffset` per track once the paths exist.
 * TODO: add the remaining circuits.
 */

import type { Track } from './types';

export const tracks: Track[] = [
  {
    id: 'spa-francorchamps',
    name: 'Spa-Francorchamps',
    country: 'Belgium',
    series: 'europe',
    svgPath: '',
    viewBox: '0 0 1000 600',
    lengthKm: 0,
    turns: 0,
    lapTimeMs: 0,
    displayDurationMs: 12000,
    sectors: [0, 0, 0],
    startFinishOffset: 0,
  },
  {
    id: 'watkins-glen',
    name: 'Watkins Glen',
    country: 'United States',
    series: 'america',
    svgPath: '',
    viewBox: '0 0 1000 600',
    lengthKm: 0,
    turns: 0,
    lapTimeMs: 0,
    displayDurationMs: 12000,
    sectors: [0, 0, 0],
    startFinishOffset: 0,
  },
  {
    id: 'suzuka',
    name: 'Suzuka',
    country: 'Japan',
    series: 'asia',
    svgPath: '',
    viewBox: '0 0 1000 600',
    lengthKm: 0,
    turns: 0,
    lapTimeMs: 0,
    displayDurationMs: 12000,
    sectors: [0, 0, 0],
    startFinishOffset: 0,
  },
];

/** First track shown before the visitor picks one. */
export const defaultTrackId = tracks[0]?.id ?? '';
