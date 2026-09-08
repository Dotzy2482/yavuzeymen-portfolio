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
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia — useMediaQuery and usePrefersReducedMotion need it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
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

// TODO: stub SVGGeometryElement.getPointAtLength once usePathPoint is tested —
// jsdom does not implement SVG geometry.
