import { describe, expect, it } from 'vitest';

import {
  buildSpeedProfile,
  distanceAtTime,
  parseLengthMetres,
  parsePolyline,
  speedProfileFor,
  type SpeedProfile,
} from './speedProfile';
import { parseLapTime } from './formatLapTime';
import { tracks } from '../data/tracks';

/** A closed polyline through `points`, in the generator's format. */
function polyline(points: [number, number][]): string {
  return `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
}

/** A circle of radius `r` around (500, 310), as `n` vertices. */
function circle(r: number, n = 180): string {
  return polyline(
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * 2 * Math.PI;
      return [500 + r * Math.cos(a), 310 + r * Math.sin(a)];
    }),
  );
}

/**
 * A stadium: a long straight along the top from the start line, a tight
 * semicircle at each end. 1 unit = 1 m when given its own length.
 */
function stadium(): { d: string; lengthM: number } {
  const points: [number, number][] = [];
  const straight = 600;
  const r = 20;
  for (let x = 200; x < 200 + straight; x += 10) points.push([x, 290]);
  for (let i = 0; i <= 30; i++) {
    const a = -Math.PI / 2 + (i / 30) * Math.PI;
    points.push([200 + straight + r * Math.cos(a), 310 + r * Math.sin(a)]);
  }
  for (let x = 200 + straight - 10; x > 200; x -= 10) points.push([x, 330]);
  for (let i = 0; i < 30; i++) {
    const a = Math.PI / 2 + (i / 30) * Math.PI;
    points.push([200 + r * Math.cos(a), 310 + r * Math.sin(a)]);
  }
  return { d: polyline(points), lengthM: 2 * straight + 2 * Math.PI * r };
}

function build(d: string, lengthM: number): SpeedProfile {
  const profile = buildSpeedProfile(d, lengthM);
  if (!profile) throw new Error('expected a profile');
  return profile;
}

describe('parsing', () => {
  it('reads the vertices of a generated outline', () => {
    expect(parsePolyline('M1 2L3.5 4L-5 6.25Z')).toEqual([
      { x: 1, y: 2 },
      { x: 3.5, y: 4 },
      { x: -5, y: 6.25 },
    ]);
  });

  it('drops a closing vertex that repeats the first', () => {
    expect(parsePolyline('M0 0L10 0L10 10L0 0Z')).toHaveLength(3);
  });

  it('reads the published length in metres', () => {
    expect(parseLengthMetres('5.148 KM')).toBeCloseTo(5148);
    expect(parseLengthMetres('nonsense')).toBe(5000);
  });

  it('declines an outline too small to drive', () => {
    expect(buildSpeedProfile('M0 0L1 1Z', 1000)).toBeNull();
    expect(buildSpeedProfile('', 1000)).toBeNull();
  });
});

describe('distanceAtTime', () => {
  const profile = build(stadium().d, stadium().lengthM);

  it('starts on the line and ends on it', () => {
    expect(distanceAtTime(profile, 0)).toBe(0);
    expect(distanceAtTime(profile, 1)).toBe(1);
    expect(distanceAtTime(profile, -0.2)).toBe(0);
    expect(distanceAtTime(profile, 1.3)).toBe(1);
    expect(distanceAtTime(profile, Number.NaN)).toBe(0);
  });

  it('never moves the car backwards', () => {
    let last = 0;
    for (let t = 0; t <= 1; t += 0.0005) {
      const d = distanceAtTime(profile, t);
      expect(d).toBeGreaterThanOrEqual(last);
      last = d;
    }
  });
});

describe('the speed model', () => {
  it('keeps an even pace round a constant-radius circle', () => {
    const profile = build(circle(150), 2 * Math.PI * 150);
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(distanceAtTime(profile, t)).toBeCloseTo(t, 2);
    }
  });

  it('is slower in the hairpins than on the straights', () => {
    const { d, lengthM } = stadium();
    const profile = build(d, lengthM);
    const speeds = [...profile.speed];
    const slowest = Math.min(...speeds);
    const fastest = Math.max(...speeds);
    expect(fastest / slowest).toBeGreaterThan(2);

    // Halfway along the first straight, well before the braking zone…
    const straight = speeds[Math.round(speeds.length * 0.12)];
    // …and at the apex of the first hairpin.
    const hairpinAt = (600 + 10 * Math.PI) / lengthM;
    const hairpin = speeds[Math.round(speeds.length * hairpinAt)];
    expect(straight).toBeGreaterThan(hairpin * 2);
  });

  it('brakes before a corner and accelerates out of it, without a jump', () => {
    const { d, lengthM } = stadium();
    const profile = build(d, lengthM);
    const step = lengthM / profile.speed.length;
    for (let i = 0; i < profile.speed.length; i++) {
      const a = profile.speed[i];
      const b = profile.speed[(i + 1) % profile.speed.length];
      // No change between two samples a few metres apart is beyond what
      // 14 m/s² of braking or 8 m/s² of traction can do over that distance.
      expect(Math.abs(b * b - a * a) / (2 * step)).toBeLessThanOrEqual(14 + 1e-6);
    }
  });

  it('spends more of the lap in the corners than their share of the distance', () => {
    const { d, lengthM } = stadium();
    const profile = build(d, lengthM);
    // Time to the end of the first straight is less than its distance share.
    const straightEnd = 600 / lengthM;
    expect(distanceAtTime(profile, straightEnd)).toBeGreaterThan(straightEnd);
  });
});

describe('every circuit', () => {
  it.each(tracks)('$name has a profile that drives the whole lap', (track) => {
    const profile = speedProfileFor(track.path, track.length);
    if (!profile) throw new Error(`no profile for ${track.name}`);
    expect(profile.time[0]).toBe(0);
    expect(profile.time.at(-1)).toBe(1);
    for (let i = 1; i < profile.time.length; i++) {
      expect(profile.time[i]).toBeGreaterThan(profile.time[i - 1]);
    }
  });

  it.each(tracks)('$name models a lap within 15% of $lap', (track) => {
    // A guard on the constants, not a claim about the driver: a typo in a
    // grip or power figure moves every lap by far more than this.
    const profile = speedProfileFor(track.path, track.length);
    const lapMs = parseLapTime(track.lap);
    if (!profile || lapMs === null) throw new Error(`cannot model ${track.name}`);
    expect(profile.lapSeconds * 1000).toBeGreaterThan(lapMs * 0.85);
    expect(profile.lapSeconds * 1000).toBeLessThan(lapMs * 1.15);
  });

  it('builds each profile once', () => {
    const [track] = tracks;
    expect(speedProfileFor(track.path, track.length)).toBe(
      speedProfileFor(track.path, track.length),
    );
  });
});
