import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SECTION_IDS } from '@/lib/constants';

import { useActiveSection } from './useActiveSection';

/** Where a section sits, in viewport coordinates, at one scroll position. */
interface Placement {
  id: string;
  top: number;
  height: number;
}

/**
 * Where every section is right now. The fake observer writes it and the
 * `getBoundingClientRect` stub reads it, so the two things the hook consults —
 * "did this cross the band?" and "where is it?" — can never disagree, which is
 * the whole point of the layout being described once per scroll position.
 */
const layout = new Map<string, Placement>();

function rectFor(id: string): DOMRect {
  const placement = layout.get(id);
  return placement
    ? DOMRect.fromRect({ x: 0, y: placement.top, width: 800, height: placement.height })
    : DOMRect.fromRect();
}

/**
 * An IntersectionObserver faithful enough to test a scroll-spy against: it
 * honours the `rootMargin` it was given, and — like the real one — reports a
 * section only when its intersecting state *changes*.
 *
 * The global stub in test/setup.ts is inert by design; it exists so components
 * do not throw. Driving one needs this.
 */
class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root: Element | null = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[] = [0];
  readonly observed = new Set<Element>();
  disconnected = false;

  private readonly intersecting = new Set<string>();
  // Assigned in the body, not as a parameter property: tsconfig sets
  // `erasableSyntaxOnly`, which rules those out.
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? '0px';
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.observed.add(el);
  }
  unobserve(el: Element): void {
    this.observed.delete(el);
  }
  disconnect(): void {
    this.observed.clear();
    this.disconnected = true;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** The root's top and bottom edges once rootMargin has been applied. */
  private rootBand(): { top: number; bottom: number } {
    const viewport = window.innerHeight;
    const parts = this.rootMargin.split(/\s+/);
    const resolve = (value = '0px') =>
      value.endsWith('%') ? (parseFloat(value) / 100) * viewport : parseFloat(value);
    return { top: -resolve(parts[0]), bottom: viewport + resolve(parts[2]) };
  }

  /**
   * Move the page to a scroll position, described by where each section lands,
   * and deliver whatever the browser would deliver for it.
   */
  scrollTo(placements: readonly Placement[]): void {
    for (const placement of placements) layout.set(placement.id, placement);

    const band = this.rootBand();
    const entries: IntersectionObserverEntry[] = [];

    for (const { id, top, height } of placements) {
      const target = document.getElementById(id);
      if (!target || !this.observed.has(target)) continue;

      const isIntersecting = top < band.bottom && top + height > band.top;
      if (isIntersecting === this.intersecting.has(id)) continue; // nothing changed
      if (isIntersecting) this.intersecting.add(id);
      else this.intersecting.delete(id);

      entries.push({
        target,
        isIntersecting,
        boundingClientRect: DOMRect.fromRect({ x: 0, y: top, width: 800, height }),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: DOMRect.fromRect(),
        rootBounds: null,
        time: 0,
      } satisfies IntersectionObserverEntry);
    }

    if (entries.length > 0) act(() => this.callback(entries, this));
  }

  static get latest(): FakeIntersectionObserver {
    const observer = FakeIntersectionObserver.instances.at(-1);
    if (!observer) throw new Error('no IntersectionObserver was constructed');
    return observer;
  }
}

/** The nav's curated four, in the order lib/constants.ts lists them. */
const NAV = ['hero', 'track-records', 'sim-to-real', 'career'] as const;

// jsdom lays nothing out, so every rect it reports is zero. The hook measures
// its candidates at decision time, which needs a real answer.
const jsdomGetBoundingClientRect = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  layout.clear();
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  Element.prototype.getBoundingClientRect = function (this: Element) {
    return rectFor(this.id);
  };
  document.body.innerHTML = SECTION_IDS.map((id) => `<section id="${id}"></section>`).join('');
});

afterEach(() => {
  vi.unstubAllGlobals();
  Element.prototype.getBoundingClientRect = jsdomGetBoundingClientRect;
  document.body.innerHTML = '';
});

describe('useActiveSection', () => {
  it('reports no active section until one is in view', () => {
    const { result } = renderHook(() => useActiveSection(NAV));

    expect(result.current).toBeNull();
  });

  it('reports the section the reader is in', () => {
    const { result } = renderHook(() => useActiveSection(NAV));

    FakeIntersectionObserver.latest.scrollTo([
      { id: 'track-records', top: 0, height: 1200 },
      { id: 'sim-to-real', top: 1200, height: 1200 },
    ]);

    expect(result.current).toBe('track-records');
  });

  it('shows nothing while the reader is in a section with no nav entry', () => {
    const { result } = renderHook(() => useActiveSection(NAV));
    const observer = FakeIntersectionObserver.latest;

    // Career fills the viewport.
    observer.scrollTo([
      { id: 'career', top: 0, height: 600 },
      { id: 'achievements', top: 600, height: 500 },
      { id: 'track-records', top: 1100, height: 1200 },
    ]);
    expect(result.current).toBe('career');

    // Scroll on into Achievements, which has no nav entry. Career's tail still
    // shows at the top of the viewport and Track Records' head at the bottom,
    // so a spy that took anything on screen would light one of them.
    observer.scrollTo([
      { id: 'career', top: -500, height: 600 },
      { id: 'achievements', top: 100, height: 500 },
      { id: 'track-records', top: 600, height: 1200 },
    ]);

    expect(result.current).toBeNull();
  });

  it('picks the section under the centre line when two cross the band', () => {
    const { result } = renderHook(() => useActiveSection(NAV));
    const observer = FakeIntersectionObserver.latest;

    // The viewport is 768 tall, so the centre line is at y=384 and the band
    // runs 345.6 to 422.4. Track Records ends at 500, below the band, so it is
    // the only candidate.
    observer.scrollTo([
      { id: 'sim-to-real', top: 500, height: 1200 },
      { id: 'track-records', top: -700, height: 1200 },
    ]);
    expect(result.current).toBe('track-records');

    // Scroll on until the boundary between them falls inside the band, so both
    // cross it. Track Records is listed first, to prove the choice is measured
    // and not arrival order: it ends at 380, four pixels above the centre line,
    // so Sim to Real is the one being read.
    observer.scrollTo([
      { id: 'track-records', top: -820, height: 1200 },
      { id: 'sim-to-real', top: 380, height: 1200 },
    ]);

    expect(result.current).toBe('sim-to-real');
  });

  it('holds its answer between intersection changes, rather than flicking at the centre', () => {
    const { result } = renderHook(() => useActiveSection(NAV));
    const observer = FakeIntersectionObserver.latest;

    // Track Records spans -1000 to 500, across the centre line at 384.
    observer.scrollTo([{ id: 'track-records', top: -1000, height: 1500 }]);
    expect(result.current).toBe('track-records');

    // It now ends at 360: past the centre line, but still inside the band. No
    // section has entered or left, so the observer says nothing and the answer
    // stands. That lag is the point — the alternative is an indicator that
    // changes on the exact pixel a boundary crosses the middle of the screen.
    observer.scrollTo([
      { id: 'track-records', top: -1140, height: 1500 },
      { id: 'content', top: 360, height: 1200 },
    ]);
    expect(result.current).toBe('track-records');

    // Once it clears the band there is a change to report, and Content — which
    // has no nav entry — leaves the nav honestly dark.
    observer.scrollTo([
      { id: 'track-records', top: -1200, height: 1500 },
      { id: 'content', top: 300, height: 1200 },
    ]);

    expect(result.current).toBeNull();
  });

  it('lights a section entering the band before it reaches the centre', () => {
    const { result } = renderHook(() => useActiveSection(NAV));

    // Scrolling back up: Career's bottom edge has dipped into the band, ending
    // at 350, while Achievements — which has no nav entry, and so is not
    // observed — still holds the centre line at 384.
    //
    // Career has to light here. Waiting for it to reach the centre would leave
    // the nav dark for the rest of the way up: Career is already intersecting
    // and Achievements is not watched, so nothing changes state in between and
    // no callback ever arrives to reconsider.
    FakeIntersectionObserver.latest.scrollTo([
      { id: 'career', top: -1200, height: 1550 },
      { id: 'track-records', top: 1000, height: 1200 },
    ]);

    expect(result.current).toBe('career');
  });

  it('reverses when the reader scrolls back up', () => {
    const { result } = renderHook(() => useActiveSection(NAV));
    const observer = FakeIntersectionObserver.latest;
    const atTrackRecords: Placement[] = [
      { id: 'track-records', top: 0, height: 1200 },
      { id: 'sim-to-real', top: 1200, height: 1200 },
    ];
    const atSimToReal: Placement[] = [
      { id: 'track-records', top: -1200, height: 1200 },
      { id: 'sim-to-real', top: 0, height: 1200 },
    ];

    observer.scrollTo(atTrackRecords);
    observer.scrollTo(atSimToReal);
    expect(result.current).toBe('sim-to-real');

    observer.scrollTo(atTrackRecords);

    expect(result.current).toBe('track-records');
  });

  it('watches a band rather than the whole viewport', () => {
    renderHook(() => useActiveSection(NAV));

    // Asserted directly because it is the mechanism behind the two tests above,
    // and the only one whose effect is invisible outside a real browser:
    // without it a one-pixel sliver of a section counts as being in it.
    const parts = FakeIntersectionObserver.latest.rootMargin.split(/\s+/);
    expect(parseFloat(parts[0])).toBeLessThan(0);
    expect(parseFloat(parts[2])).toBeLessThan(0);
  });

  it('does not rebuild the observer when the caller passes a fresh array', () => {
    // NAV_ITEMS.map(...) at the call site is a new array on every render. The
    // hook owns that, so no caller has to remember to memoise.
    const { result, rerender } = renderHook(() => useActiveSection([...NAV]));

    FakeIntersectionObserver.latest.scrollTo([{ id: 'career', top: 0, height: 900 }]);
    rerender();

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    expect(result.current).toBe('career');
  });

  it('ignores a nav id whose section is not in the document', () => {
    document.getElementById('sim-to-real')?.remove();

    const { result } = renderHook(() => useActiveSection(NAV));

    expect(FakeIntersectionObserver.latest.observed.size).toBe(NAV.length - 1);
    expect(result.current).toBeNull();
  });

  it('stops observing when unmounted', () => {
    const { unmount } = renderHook(() => useActiveSection(NAV));
    const observer = FakeIntersectionObserver.latest;

    unmount();

    expect(observer.disconnected).toBe(true);
  });
});
