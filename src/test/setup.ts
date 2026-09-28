/**
 * Vitest global setup — runs once before every test file.
 *
 * Registers jest-dom matchers and stubs the browser APIs jsdom does not
 * implement but that this (heavily animated, scroll-driven) site relies on.
 *
 * Every stub here is `configurable`, so an individual test file can replace it
 * with `vi.stubGlobal` — these are inert defaults that keep a component from
 * throwing, not fakes a test can drive. A scroll-spy test needs an observer it
 * can fire entries through, and a non-configurable property cannot be
 * redefined.
 */

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia — useMediaQuery and usePrefersReducedMotion need it.
//
// A plain function, not a vi.fn(): vi.restoreAllMocks() strips a vi.fn() of
// the implementation it was given, so one test restoring its own spies would
// leave every later render in the file crashing on `undefined.matches`.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom has no IntersectionObserver — useInView needs it.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});

// jsdom implements no SVG geometry — it does not even give <path> its own
// class, so every SVG node is a bare SVGElement. The lap loop measures and
// walks the circuit outline with getTotalLength() / getPointAtLength(), and
// without them it sees a zero-length path and never draws a frame.
//
// This is not the browser's curve maths. `d` is walked as a closed polyline
// through every coordinate pair it contains, control points included: exact
// for straight segments, deterministic for everything else, positive for any
// real circuit and inside its viewBox. Enough for code that needs *a* length
// and *a* point, which is all a test can observe anyway. An element with no
// `d` measures zero, as a non-geometry element would.
interface StubPoint {
  x: number;
  y: number;
}

interface Polyline {
  points: StubPoint[];
  /** Distance along the polyline at each point; the last entry is the total. */
  distances: number[];
}

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const polylines = new Map<string, Polyline>();

function polylineOf(element: Element): Polyline {
  const d = element.getAttribute('d') ?? '';
  const cached = polylines.get(d);
  if (cached) return cached;

  const numbers = (d.match(NUMBER) ?? []).map(Number);
  const points: StubPoint[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) points.push({ x: numbers[i], y: numbers[i + 1] });
  if (points.length > 0) points.push(points[0]);

  const distances = points.map(() => 0);
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    distances[i] = distances[i - 1] + Math.hypot(b.x - a.x, b.y - a.y);
  }

  const polyline = { points, distances };
  polylines.set(d, polyline);
  return polyline;
}

Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
  writable: true,
  configurable: true,
  value(this: SVGElement): number {
    return polylineOf(this).distances.at(-1) ?? 0;
  },
});

Object.defineProperty(SVGElement.prototype, 'getPointAtLength', {
  writable: true,
  configurable: true,
  value(this: SVGElement, distance: number): StubPoint {
    const { points, distances } = polylineOf(this);
    if (points.length === 0) return { x: 0, y: 0 };
    // Like the real thing, a distance off either end clamps to that end.
    const target = Math.min(Math.max(distance, 0), distances[distances.length - 1]);
    // The polyline is closed, so it always has at least two points.
    const i = Math.max(
      1,
      distances.findIndex((at) => at >= target),
    );
    const [a, b] = [points[i - 1], points[i]];
    const span = distances[i] - distances[i - 1];
    const t = span > 0 ? (target - distances[i - 1]) / span : 0;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  },
});
