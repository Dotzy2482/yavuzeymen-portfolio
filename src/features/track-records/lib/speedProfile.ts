/**
 * Where the car is, given how far through the lap the clock is.
 *
 * The marker used to cover equal distance in equal time, so it took a
 * hairpin at the speed of the main straight. This module gives each circuit a
 * speed profile drawn from its own outline, the way a lap simulator's simplest
 * model does it:
 *
 * 1. **Walk the outline in metres.** The path is resampled every
 *    `SAMPLE_M`, and scaled from viewBox units to metres by the circuit's
 *    published length.
 * 2. **Measure how hard it turns.** Curvature at each sample is the total
 *    heading change over a short window, divided by the window, then smoothed.
 *    Summing |turn| rather than taking the net turn keeps a chicane from
 *    cancelling itself out, and the smoothing spreads the polyline's vertex
 *    kinks (the outlines are simplified to 1 m) back into the curve they came
 *    from, so a long fast bend does not stutter at every vertex.
 * 3. **Cap the speed each corner allows.** `v = √(a_lat / κ)`, between a
 *    hairpin floor and a top speed.
 * 4. **Brake and accelerate into it.** A forward pass limits how fast the car
 *    can gain speed out of a corner, and a backward pass how late it can brake
 *    into one, each run twice round the closed lap so the start line is no
 *    seam. This is what makes the motion smooth: speed never jumps.
 * 5. **Integrate time.** Each sample's share of the lap is its length over its
 *    speed; the running sum, normalised, maps lap time to lap distance.
 *
 * The constants are a GT3 car, loosely: about 1.7 g of cornering, 1.4 g of
 * braking, power-limited acceleration, 275 km/h at the top. They are not a
 * simulation of anything. They were tuned against the handoff's placeholder
 * GT3 lap times, where every modelled lap landed within 6% and the slowest
 * corners came out at 65–96 km/h — a fair sign the shape of each lap is right.
 * A test holds every lap within 15% of `track.lap`, and Yavuz's real personal
 * bests, in five different cars, sit inside it.
 *
 * Everything here is pure arithmetic on the `d` string, so it runs, and is
 * tested, without a browser. It relies on the outlines being polylines
 * (`M x y L x y … Z`), which the generator guarantees.
 */

/** Resampling step along the outline, in metres. */
const SAMPLE_M = 4;
/** Window over which heading change is summed into curvature, in metres. */
const TURN_WINDOW_M = 24;
/** Box-smoothing half-width applied to curvature, in metres (run twice). */
const SMOOTH_M = 12;

/** Lateral grip, m/s². Averaged over slow and fast corners, so below a GT3's peak. */
const LATERAL_G = 17;
/** Braking, m/s². */
const BRAKING = 14;
/** Peak traction-limited acceleration, m/s². */
const ACCEL_MAX = 8;
/** Power per unit mass, W/kg: past ACCEL_MAX, acceleration is this over speed. */
const POWER_PER_KG = 300;
/** Top speed, m/s (~275 km/h). */
const V_TOP = 76;
/** Slowest the car ever goes, m/s (~58 km/h): a floor for the tightest hairpin. */
const V_MIN = 16;

/** Used when a circuit's length cannot be parsed: a typical GP circuit. */
const FALLBACK_LENGTH_M = 5000;

interface Point {
  x: number;
  y: number;
}

/**
 * A lap's time-to-distance map: at sample `i`, `time[i]` of the lap has passed
 * and the car is `distance[i]` of the way round. Both run 0 → 1 and never
 * decrease.
 */
export interface SpeedProfile {
  time: Float64Array;
  distance: Float64Array;
  /** Speed at each sample, m/s. Not used by the loop; kept for tests and tuning. */
  speed: Float64Array;
  /** The modelled lap, in seconds. Likewise only for tests and tuning. */
  lapSeconds: number;
}

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/** The vertices of a polyline `d`, without repeating the first at the end. */
export function parsePolyline(d: string): Point[] {
  const numbers = (d.match(NUMBER) ?? []).map(Number);
  const points: Point[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) points.push({ x: numbers[i], y: numbers[i + 1] });
  const first = points[0];
  const last = points.at(-1);
  if (points.length > 1 && first && last && first.x === last.x && first.y === last.y) points.pop();
  return points;
}

/** `'5.148 KM'` → 5148. Falls back to a typical circuit if it cannot parse. */
export function parseLengthMetres(length: string): number {
  const km = Number.parseFloat(length.replace(',', '.'));
  return Number.isFinite(km) && km > 0 ? km * 1000 : FALLBACK_LENGTH_M;
}

/** Wraps an angle difference into (-π, π]. */
function wrapAngle(angle: number): number {
  let a = angle;
  while (a <= -Math.PI) a += 2 * Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

/** Resamples a closed polyline at an even step; returns points and step. */
function resample(points: Point[], step: number): { samples: Point[]; step: number } {
  const n = points.length;
  const segLengths: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    segLengths.push(length);
    total += length;
  }

  // A whole number of steps, so the last one closes the loop exactly.
  const count = Math.max(8, Math.round(total / step));
  const even = total / count;
  const samples: Point[] = [];
  let seg = 0;
  let segStart = 0;
  for (let k = 0; k < count; k++) {
    const target = k * even;
    while (seg < n - 1 && segStart + segLengths[seg] < target) {
      segStart += segLengths[seg];
      seg += 1;
    }
    const a = points[seg];
    const b = points[(seg + 1) % n];
    const t = segLengths[seg] > 0 ? (target - segStart) / segLengths[seg] : 0;
    samples.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return { samples, step: even };
}

/** Circular box blur of `values` with half-width `radius` samples. */
function boxSmooth(values: Float64Array<ArrayBuffer>, radius: number): Float64Array<ArrayBuffer> {
  const n = values.length;
  if (radius < 1) return values;
  const out = new Float64Array(n);
  let sum = 0;
  for (let j = -radius; j <= radius; j++) sum += values[((j % n) + n) % n];
  const width = 2 * radius + 1;
  for (let i = 0; i < n; i++) {
    out[i] = sum / width;
    sum += values[(i + radius + 1) % n] - values[(((i - radius) % n) + n) % n];
  }
  return out;
}

/** Acceleration available at speed `v`: traction-limited low down, power-limited above. */
function acceleration(v: number): number {
  return Math.min(ACCEL_MAX, POWER_PER_KG / Math.max(v, 1));
}

/**
 * The speed profile of a closed polyline outline `d`, whose real length is
 * `lengthMetres`. Returns null when the outline is too small to drive.
 */
export function buildSpeedProfile(d: string, lengthMetres: number): SpeedProfile | null {
  const vertices = parsePolyline(d);
  if (vertices.length < 3) return null;

  let unitLength = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    unitLength += Math.hypot(b.x - a.x, b.y - a.y);
  }
  if (unitLength <= 0) return null;
  const metresPerUnit = lengthMetres / unitLength;

  const { samples, step: stepUnits } = resample(vertices, SAMPLE_M / metresPerUnit);
  const n = samples.length;
  const ds = stepUnits * metresPerUnit;

  // Heading of the segment leaving each sample, and the turn at each sample.
  const heading = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = samples[i];
    const b = samples[(i + 1) % n];
    heading[i] = Math.atan2(b.y - a.y, b.x - a.x);
  }
  const turn = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    turn[i] = Math.abs(wrapAngle(heading[i] - heading[(i - 1 + n) % n]));
  }

  // Curvature: |turn| averaged across the window, per metre, then smoothed.
  const half = Math.max(1, Math.round(TURN_WINDOW_M / 2 / ds));
  const meanTurn = boxSmooth(turn, half);
  let curvature = new Float64Array(n);
  for (let i = 0; i < n; i++) curvature[i] = meanTurn[i] / ds;
  const smooth = Math.max(1, Math.round(SMOOTH_M / ds));
  curvature = boxSmooth(boxSmooth(curvature, smooth), smooth);

  // The speed each corner allows on its own.
  const speed = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const k = curvature[i];
    const corner = k > 0 ? Math.sqrt(LATERAL_G / k) : V_TOP;
    speed[i] = Math.min(V_TOP, Math.max(V_MIN, corner));
  }

  // Accelerate out of corners, then brake into them. Twice round each way,
  // so the lap has no seam at the start line.
  for (let pass = 1; pass <= 2 * n; pass++) {
    const i = pass % n;
    const prev = (pass - 1) % n;
    const reachable = Math.sqrt(speed[prev] ** 2 + 2 * acceleration(speed[prev]) * ds);
    if (speed[i] > reachable) speed[i] = reachable;
  }
  for (let pass = 2 * n - 1; pass >= 0; pass--) {
    const i = pass % n;
    const next = (pass + 1) % n;
    const stoppable = Math.sqrt(speed[next] ** 2 + 2 * BRAKING * ds);
    if (speed[i] > stoppable) speed[i] = stoppable;
  }

  // Time for each step at the mean speed across it, then the running sums.
  const time = new Float64Array(n + 1);
  const distance = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    const mean = (speed[i] + speed[(i + 1) % n]) / 2;
    time[i + 1] = time[i] + ds / mean;
    distance[i + 1] = (i + 1) / n;
  }
  const lapSeconds = time[n];
  for (let i = 0; i <= n; i++) time[i] /= lapSeconds;
  time[n] = 1;
  distance[n] = 1;

  return { time, distance, speed, lapSeconds };
}

/**
 * How far round the lap (0–1) the car is once `timeFraction` (0–1) of the lap
 * has passed. Linear between samples, which are a few metres apart, so speed
 * changes step by step too finely to see. Exact at both ends: 0 → 0, 1 → 1.
 */
export function distanceAtTime(profile: SpeedProfile, timeFraction: number): number {
  const { time, distance } = profile;
  if (!(timeFraction > 0)) return 0;
  if (timeFraction >= 1) return 1;

  let lo = 0;
  let hi = time.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (time[mid] <= timeFraction) lo = mid;
    else hi = mid;
  }
  const span = time[hi] - time[lo];
  const t = span > 0 ? (timeFraction - time[lo]) / span : 0;
  return distance[lo] + (distance[hi] - distance[lo]) * t;
}

const profiles = new Map<string, { length: string; profile: SpeedProfile | null }>();

/**
 * The profile for an outline, built once and cached: the outlines never change
 * at runtime and a build walks a few thousand samples. The loop asks every
 * frame, so the key is `d` itself — the same string each time, whose hash the
 * engine keeps — rather than anything built from it.
 */
export function speedProfileFor(d: string, length: string): SpeedProfile | null {
  const cached = profiles.get(d);
  if (cached && cached.length === length) return cached.profile;
  const profile = buildSpeedProfile(d, parseLengthMetres(length));
  profiles.set(d, { length, profile });
  return profile;
}
