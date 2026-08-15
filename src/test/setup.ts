/**
 * Vitest global setup — runs once before every test file.
 *
 * Registers jest-dom matchers and stubs the browser APIs jsdom does not
 * implement but that this (heavily animated, scroll-driven) site relies on.
 *
 * No tests are written yet; this file only guarantees the harness is ready.
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
  value: IntersectionObserverStub,
});

// TODO: stub SVGGeometryElement.getPointAtLength once usePathPoint is tested —
// jsdom does not implement SVG geometry.
