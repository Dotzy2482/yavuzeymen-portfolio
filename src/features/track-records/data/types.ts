/**
 * Domain types for the track-records feature.
 *
 * These are internal to the module except for the handful re-exported from
 * `features/track-records/index.ts`.
 */

/** Geographic grouping used to filter the track list. */
export type TrackSeries = 'europe' | 'america' | 'asia';

export type TrackId = string;

/**
 * Sector split as percentages of the lap, in order [S1, S2, S3].
 * Must sum to 100.
 */
export type SectorSplit = readonly [number, number, number];

export interface Track {
  id: TrackId;
  name: string;
  country: string;
  series: TrackSeries;

  /**
   * The `d` attribute of the circuit outline. A single closed subpath — the
   * car marker is positioned with getPointAtLength(), which needs one
   * continuous path to walk along.
   */
  svgPath: string;
  /** viewBox for the SVG the path was authored in, e.g. `'0 0 1000 600'`. */
  viewBox: string;

  lengthKm: number;
  turns: number;

  /**
   * The real lap time in milliseconds — what gets displayed on the timer.
   */
  lapTimeMs: number;
  /**
   * How long the on-screen animation takes, in milliseconds.
   *
   * Deliberately separate from `lapTimeMs`: an endurance lap can run to eight
   * real minutes, but nobody watches a dot for eight minutes. The animation
   * finishes in ~12s while the timer still counts out the true lap time. The
   * two are related only by the ratio lapTimeMs / displayDurationMs.
   */
  displayDurationMs: number;

  /** [S1, S2, S3] as percentages of the lap. Sums to 100. */
  sectors: SectorSplit;

  /**
   * Where the start/finish line sits along the path, 0–1.
   * getPointAtLength() starts at the path's own origin, which is rarely the
   * start/finish line; this offset rotates the lap so it begins in the right
   * place.
   */
  startFinishOffset: number;
}

/** A point on the circuit plus the heading at that point, for the car marker. */
export interface PathPoint {
  x: number;
  y: number;
  /** Tangent angle in degrees, for rotating the marker. */
  angle: number;
}

/** Which of the three sectors a lap position falls in. */
export type SectorIndex = 0 | 1 | 2;
