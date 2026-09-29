/**
 * Domain types for the track-records feature.
 *
 * These are internal to the module except for the handful re-exported from
 * `features/track-records/index.ts`.
 *
 * The shape mirrors the design's `tracks.js`, which is the single source of
 * truth shared by the desktop and mobile prototypes: lap times and lengths
 * are authored as display strings, and the country flag is a CSS gradient
 * rather than an image.
 */

import type { CountryCode } from './flags';

/**
 * Geographic grouping used by the region tabs. `APAC` is Asia-Pacific — Suzuka
 * and Mount Panorama — and is abbreviated because `ASIA-PACIFIC` wraps onto two
 * lines in the tab row at 390px wide.
 */
export type TrackRegion = 'EUROPE' | 'AMERICA' | 'APAC';

export type TrackId = string;

export interface Track {
  id: TrackId;
  region: TrackRegion;
  name: string;

  /**
   * Personal best, authored as `M:SS.mmm`. Kept as a string because that is
   * what gets displayed; the chronometer parses it to milliseconds.
   */
  lap: string;
  /** Circuit length with the unit baked in, e.g. `'5.148 KM'`. */
  length: string;
  corners: number;

  /**
   * Country the circuit is in. Resolves through `COUNTRIES` in `flags.ts` to
   * both the flag gradient and the country's name — the name is what makes
   * the flag chip accessible to anyone who cannot see it or does not
   * recognise it.
   */
  country: CountryCode;

  /**
   * The `d` attribute of the circuit outline: one continuous closed subpath
   * in the shared 1000×620 viewBox. The car marker is positioned with
   * getPointAtLength(), which needs a single path to walk along.
   *
   * Real geometry, derived from OpenStreetMap (© OpenStreetMap contributors,
   * ODbL) by docs/assets/generate-track-paths.mjs into `trackPaths.ts`: a
   * polyline that runs in the circuit's direction of travel and is rotated so
   * distance 0 *is* the start/finish line. North up, or turned a quarter where
   * that lets a tall circuit lie landscape — the shape itself is untouched. That rotation is why
   * nothing downstream needs a start-line offset.
   */
  path: string;
}

/** The part of a `Track` the geometry generator owns. */
export type TrackGeometry = Pick<Track, 'path'>;

/** A point on the circuit plus the heading at that point, for the car marker. */
export interface PathPoint {
  x: number;
  y: number;
  /** Tangent angle in degrees. */
  angle: number;
}

/** Which of the three sectors a lap position falls in. */
export type SectorIndex = 0 | 1 | 2;

/** Every circuit outline is authored in this coordinate space. */
export const TRACK_VIEW_WIDTH = 1000;
export const TRACK_VIEW_HEIGHT = 620;
export const TRACK_VIEWBOX = `0 0 ${TRACK_VIEW_WIDTH} ${TRACK_VIEW_HEIGHT}`;

/**
 * How long one on-screen lap takes at 1×, in milliseconds.
 *
 * Deliberately independent of the real lap time: an endurance lap can run to
 * minutes, but nobody watches a dot for that long. The dot always completes a
 * circuit in ~12s while the chronometer counts out the true lap time, landing
 * exactly on the personal best as the dot crosses the line.
 */
export const LAP_DURATION_MS = 12_000;

/** Length of the bright trail behind the car dot, in path units. */
export const TRAIL_LENGTH = 70;
