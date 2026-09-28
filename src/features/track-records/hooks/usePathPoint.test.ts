import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePathPoint } from './usePathPoint';
import { tracks } from '../data/tracks';
import type { PathPoint } from '../data/types';

// Geometry comes from the polyline stub in test/setup.ts: deterministic, not
// the browser's curve maths. What is under test is the hook's caching, which
// does not care how a length is arrived at.

const SVG_NS = 'http://www.w3.org/2000/svg';

/** A detached <path> carrying a circuit's outline. */
function pathFor(d: string): SVGPathElement {
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  return path;
}

/** Two distinct outlines, whatever the data currently holds. */
function twoOutlines(): [string, string] {
  const [first, second] = [...new Set(tracks.map((track) => track.path))];
  if (!first || !second) throw new Error('the data needs two distinct circuit outlines');
  return [first, second];
}

/** Equal to within float noise — wrapping a distance is a modulo, not a lookup. */
function expectSamePoint(actual: PathPoint, expected: PathPoint): void {
  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
  expect(actual.angle).toBeCloseTo(expected.angle, 6);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePathPoint', () => {
  it('measures a circuit once, however many frames ask', () => {
    const [d] = twoOutlines();
    const path = pathFor(d);
    const getTotalLength = vi.spyOn(path, 'getTotalLength');
    const { result } = renderHook(() => usePathPoint());

    const first = result.current.measure(path, d);
    const again = result.current.measure(path, d);

    expect(first).toBeGreaterThan(0);
    expect(again).toBe(first);
    expect(getTotalLength).toHaveBeenCalledTimes(1);
  });

  it('re-measures when the circuit changes', () => {
    const [a, b] = twoOutlines();
    const path = pathFor(a);
    const { result } = renderHook(() => usePathPoint());
    result.current.measure(path, a);

    // React swaps the `d` attribute on the same element when the selection
    // changes; the new key is what tells the hook its cached length is stale.
    path.setAttribute('d', b);
    const getTotalLength = vi.spyOn(path, 'getTotalLength');
    const length = result.current.measure(path, b);

    expect(getTotalLength).toHaveBeenCalledTimes(1);
    expect(length).toBe(pathFor(b).getTotalLength());
  });

  it('re-reads the same circuit after invalidate()', () => {
    const [d] = twoOutlines();
    const path = pathFor(d);
    const getTotalLength = vi.spyOn(path, 'getTotalLength');
    const { result } = renderHook(() => usePathPoint());

    result.current.measure(path, d);
    result.current.invalidate();
    result.current.measure(path, d);

    expect(getTotalLength).toHaveBeenCalledTimes(2);
  });

  it('keeps its cache across re-renders', () => {
    // The cache lives in refs precisely so a render — which the lap loop never
    // causes, but a selection change does — does not throw it away.
    const [d] = twoOutlines();
    const path = pathFor(d);
    const getTotalLength = vi.spyOn(path, 'getTotalLength');
    const { result, rerender } = renderHook(() => usePathPoint());

    result.current.measure(path, d);
    rerender();
    result.current.measure(path, d);

    expect(getTotalLength).toHaveBeenCalledTimes(1);
  });

  it('wraps a distance past the line back onto the lap', () => {
    // The seam: a lap's end is its start, so the marker loops without a jump.
    const [d] = twoOutlines();
    const path = pathFor(d);
    const { result } = renderHook(() => usePathPoint());
    const total = result.current.measure(path, d);

    expectSamePoint(result.current.pointAt(path, total), result.current.pointAt(path, 0));
    expectSamePoint(result.current.pointAt(path, total + 10), result.current.pointAt(path, 10));
  });
});
