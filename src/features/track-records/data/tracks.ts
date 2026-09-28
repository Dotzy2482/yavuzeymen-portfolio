/**
 * Circuit data. Hand-maintained: edit a lap time, a length or a name here and
 * nothing else needs running.
 *
 * The outlines are the exception. Each `path` comes from `trackPaths.ts`,
 * which docs/assets/generate-track-paths.mjs derives from OpenStreetMap
 * (© OpenStreetMap contributors, ODbL) — real geometry, north up, running in
 * the direction of travel and starting on the start/finish line. Never inline
 * or patch a path here; change docs/assets/circuits.json and regenerate. See
 * docs/TRACK_RECORDS.md.
 *
 * Lap times, lengths and corner counts are still placeholder values from the
 * design handoff, waiting on the iRacing profile. The flag gradient lives in
 * `flags.ts`, keyed by `country`.
 */

import { trackPaths } from './trackPaths';
import type { Track, TrackRegion } from './types';

export const tracks: Track[] = [
  {
    id: 'NUR',
    region: 'EUROPE',
    country: 'DE',
    name: 'Nürburgring GP',
    lap: '1:54.318',
    length: '5.148 KM',
    corners: 15,
    path: trackPaths.NUR.path,
  },
  {
    id: 'ZAN',
    region: 'EUROPE',
    country: 'NL',
    name: 'Zandvoort',
    lap: '1:35.774',
    length: '4.259 KM',
    corners: 14,
    path: trackPaths.ZAN.path,
  },
  {
    id: 'IMO',
    region: 'EUROPE',
    country: 'IT',
    name: 'Imola',
    lap: '1:41.925',
    length: '4.909 KM',
    corners: 19,
    path: trackPaths.IMO.path,
  },
  {
    id: 'SIL',
    region: 'EUROPE',
    country: 'GB',
    name: 'Silverstone',
    lap: '1:57.930',
    length: '5.891 KM',
    corners: 18,
    path: trackPaths.SIL.path,
  },
  {
    id: 'RBR',
    region: 'EUROPE',
    country: 'AT',
    name: 'Red Bull Ring',
    lap: '1:28.641',
    length: '4.318 KM',
    corners: 10,
    path: trackPaths.RBR.path,
  },
  {
    id: 'COT',
    region: 'AMERICA',
    country: 'US',
    name: 'COTA',
    lap: '2:02.187',
    length: '5.513 KM',
    corners: 20,
    path: trackPaths.COT.path,
  },
  {
    id: 'WGL',
    region: 'AMERICA',
    country: 'US',
    name: 'Watkins Glen',
    lap: '1:44.912',
    length: '5.552 KM',
    corners: 11,
    path: trackPaths.WGL.path,
  },
  {
    id: 'RAT',
    region: 'AMERICA',
    country: 'US',
    name: 'Road Atlanta',
    lap: '1:22.503',
    length: '4.088 KM',
    corners: 12,
    path: trackPaths.RAT.path,
  },
  {
    id: 'LAG',
    region: 'AMERICA',
    country: 'US',
    name: 'Laguna Seca',
    lap: '1:22.940',
    length: '3.602 KM',
    corners: 11,
    path: trackPaths.LAG.path,
  },
  {
    id: 'INT',
    region: 'AMERICA',
    country: 'BR',
    name: 'Interlagos',
    lap: '1:31.276',
    length: '4.309 KM',
    corners: 15,
    path: trackPaths.INT.path,
  },
  {
    id: 'BAT',
    region: 'APAC',
    country: 'AU',
    name: 'Mount Panorama',
    lap: '2:01.947',
    length: '6.213 KM',
    corners: 23,
    path: trackPaths.BAT.path,
  },
  {
    id: 'SUZ',
    region: 'APAC',
    country: 'JP',
    name: 'Suzuka',
    lap: '1:57.203',
    length: '5.807 KM',
    corners: 18,
    path: trackPaths.SUZ.path,
  },
];

/** Tab order of the region filter. */
export const TRACK_REGIONS: readonly TrackRegion[] = ['EUROPE', 'AMERICA', 'APAC'];

/** First track shown before the visitor picks one. */
export const defaultTrackId = tracks[0]?.id ?? '';
