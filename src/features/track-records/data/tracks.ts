/**
 * Circuit data. Hand-maintained: edit a lap time, a length or a name here and
 * nothing else needs running.
 *
 * The outlines are the exception. Each `path` and its `sectors` (where the
 * real timing lines fall) come from `trackPaths.ts`,
 * which docs/assets/generate-track-paths.mjs derives from OpenStreetMap
 * (© OpenStreetMap contributors, ODbL) — real geometry, running in the
 * direction of travel and starting on the start/finish line; north up, or a
 * quarter turn from it where that lets a tall circuit lie landscape. Never inline
 * or patch a path here; change docs/assets/circuits.json and regenerate. See
 * docs/TRACK_RECORDS.md.
 *
 * Lengths and corner counts are the published figures for the layouts drawn,
 * and the generator warns if a length drifts more than 3% from the measured
 * ring.
 *
 * Lap times are Yavuz's real iRacing personal bests, read off his profile in
 * November 2026: for each circuit, the fastest lap in any car and any session
 * (practice, qualifying or race), with `car` naming the car it was set in. A
 * circuit is listed only if he has a lap there, and only in the layout he drove
 * — Spa is the Grand Prix layout, Fuji the one with the chicane, the
 * Nürburgring the Nordschleife on its own (Industriefahrten). The flag gradient
 * lives in `flags.ts`, keyed by `country`.
 */

import { trackPaths } from './trackPaths';
import type { Track, TrackRegion } from './types';

export const tracks: Track[] = [
  {
    id: 'SPA',
    region: 'EUROPE',
    country: 'BE',
    name: 'Spa-Francorchamps',
    lap: '2:15.125',
    car: 'Ford Mustang GT3',
    length: '7.004 KM',
    corners: 19,
    path: trackPaths.SPA.path,
    sectors: trackPaths.SPA.sectors,
  },
  {
    id: 'NOS',
    region: 'EUROPE',
    country: 'DE',
    name: 'Nordschleife',
    lap: '6:26.143',
    car: 'Ford Mustang GT3',
    length: '20.832 KM',
    corners: 73,
    path: trackPaths.NOS.path,
    sectors: trackPaths.NOS.sectors,
  },
  {
    id: 'MON',
    region: 'EUROPE',
    country: 'IT',
    name: 'Monza',
    lap: '1:46.275',
    car: 'Porsche 911 Cup (992.2)',
    length: '5.793 KM',
    corners: 11,
    path: trackPaths.MON.path,
    sectors: trackPaths.MON.sectors,
  },
  {
    id: 'BAR',
    region: 'EUROPE',
    country: 'ES',
    name: 'Barcelona-Catalunya',
    lap: '1:44.954',
    car: 'McLaren 720S GT3 EVO',
    length: '4.657 KM',
    corners: 14,
    path: trackPaths.BAR.path,
    sectors: trackPaths.BAR.sectors,
  },
  {
    id: 'LMS',
    region: 'EUROPE',
    country: 'FR',
    name: 'Le Mans',
    lap: '3:58.956',
    car: 'McLaren 720S GT3 EVO',
    length: '13.626 KM',
    corners: 38,
    path: trackPaths.LMS.path,
    sectors: trackPaths.LMS.sectors,
  },
  {
    id: 'RAM',
    region: 'AMERICA',
    country: 'US',
    name: 'Road America',
    lap: '2:02.968',
    car: 'Ford Mustang GT3',
    length: '6.515 KM',
    corners: 14,
    path: trackPaths.RAM.path,
    sectors: trackPaths.RAM.sectors,
  },
  {
    id: 'SEB',
    region: 'AMERICA',
    country: 'US',
    name: 'Sebring',
    lap: '1:58.882',
    car: 'Ford Mustang GT3',
    length: '6.019 KM',
    corners: 17,
    path: trackPaths.SEB.path,
    sectors: trackPaths.SEB.sectors,
  },
  {
    id: 'VIR',
    region: 'AMERICA',
    country: 'US',
    name: 'Virginia',
    lap: '1:43.107',
    car: 'Ford Mustang GT3',
    length: '5.263 KM',
    corners: 17,
    path: trackPaths.VIR.path,
    sectors: trackPaths.VIR.sectors,
  },
  {
    id: 'IND',
    region: 'AMERICA',
    country: 'US',
    name: 'Indianapolis',
    lap: '1:23.730',
    car: 'McLaren 720S GT3 EVO',
    length: '3.925 KM',
    corners: 14,
    path: trackPaths.IND.path,
    sectors: trackPaths.IND.sectors,
  },
  {
    id: 'RAT',
    region: 'AMERICA',
    country: 'US',
    name: 'Road Atlanta',
    lap: '1:17.408',
    car: 'Ford Mustang GT3',
    length: '4.088 KM',
    corners: 12,
    path: trackPaths.RAT.path,
    sectors: trackPaths.RAT.sectors,
  },
  {
    id: 'LAG',
    region: 'AMERICA',
    country: 'US',
    name: 'Laguna Seca',
    lap: '1:20.466',
    car: 'Ford Mustang GT3',
    length: '3.602 KM',
    corners: 11,
    path: trackPaths.LAG.path,
    sectors: trackPaths.LAG.sectors,
  },
  {
    id: 'BAT',
    region: 'APAC',
    country: 'AU',
    name: 'Mount Panorama',
    lap: '2:02.489',
    car: 'Ford Mustang GT3',
    length: '6.213 KM',
    corners: 23,
    path: trackPaths.BAT.path,
    sectors: trackPaths.BAT.sectors,
  },
  {
    id: 'FUJ',
    region: 'APAC',
    country: 'JP',
    name: 'Fuji Speedway',
    lap: '1:38.106',
    car: 'Ferrari 296 GT3',
    length: '4.563 KM',
    corners: 16,
    path: trackPaths.FUJ.path,
    sectors: trackPaths.FUJ.sectors,
  },
  {
    id: 'OKA',
    region: 'APAC',
    country: 'JP',
    name: 'Okayama',
    lap: '1:37.645',
    car: 'Ferrari 296 GT3',
    length: '3.703 KM',
    corners: 13,
    path: trackPaths.OKA.path,
    sectors: trackPaths.OKA.sectors,
  },
];

/** Tab order of the region filter. */
export const TRACK_REGIONS: readonly TrackRegion[] = ['EUROPE', 'AMERICA', 'APAC'];

/** First track shown before the visitor picks one. */
export const defaultTrackId = tracks[0]?.id ?? '';
