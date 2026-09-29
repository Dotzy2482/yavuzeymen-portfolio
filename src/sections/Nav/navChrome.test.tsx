import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DesktopBar } from './DesktopBar';
import { MobileMenu } from './MobileMenu';
import { useSectionPassed } from './useNavChrome';

/**
 * An IntersectionObserver a test can speak for: it records what it was asked
 * to watch and with which rootMargin, and delivers whatever entry the test
 * describes. The layout-faithful fake in useActiveSection.test.ts is more than
 * one observed section needs.
 */
class ScriptedObserver implements IntersectionObserver {
  static latest: ScriptedObserver | null = null;

  readonly root: Element | null = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[] = [0];
  target: Element | null = null;
  // Assigned in the body: `erasableSyntaxOnly` rules out parameter properties.
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? '0px';
    ScriptedObserver.latest = this;
  }

  observe(el: Element): void {
    this.target = el;
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Report the target at `top`, `height` tall, as in or out of the root. */
  report(isIntersecting: boolean, top: number, height: number): void {
    const target = this.target;
    if (!target) throw new Error('nothing observed');
    act(() =>
      this.callback(
        [
          {
            target,
            isIntersecting,
            boundingClientRect: DOMRect.fromRect({ x: 0, y: top, width: 1440, height }),
            intersectionRatio: isIntersecting ? 1 : 0,
            intersectionRect: DOMRect.fromRect(),
            rootBounds: null,
            time: 0,
          },
        ],
        this,
      ),
    );
  }
}

function latestObserver(): ScriptedObserver {
  const observer = ScriptedObserver.latest;
  if (!observer) throw new Error('no IntersectionObserver was constructed');
  return observer;
}

describe('useSectionPassed', () => {
  beforeEach(() => {
    ScriptedObserver.latest = null;
    vi.stubGlobal('IntersectionObserver', ScriptedObserver);
    document.body.innerHTML = '<section id="hero"></section>';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('watches the section against the viewport minus the bar', () => {
    renderHook(() => useSectionPassed('hero', 64));
    const observer = latestObserver();
    expect(observer.target).toBe(document.getElementById('hero'));
    expect(observer.rootMargin).toBe('-64px 0px 0px 0px');
  });

  it('turns true once the last pixel slides under the bar, and back on the way up', () => {
    const { result } = renderHook(() => useSectionPassed('hero', 64));
    const observer = latestObserver();

    observer.report(true, 0, 900);
    expect(result.current).toBe(false);

    // Bottom edge at 60px: under a 64px bar.
    observer.report(false, -840, 900);
    expect(result.current).toBe(true);

    observer.report(true, -500, 900);
    expect(result.current).toBe(false);
  });

  it('does not count a section below the viewport as passed', () => {
    const { result } = renderHook(() => useSectionPassed('hero', 64));
    latestObserver().report(false, 1200, 900);
    expect(result.current).toBe(false);
  });
});

describe('DesktopBar', () => {
  const noop = () => {};

  it('is inert while the hero is on screen, so nothing in it takes focus', () => {
    const { container } = render(
      <DesktopBar
        shown={false}
        activeId="hero"
        menuOpen={false}
        onToggleMenu={noop}
        linkClassName=""
      />,
    );
    expect(container.querySelector('[data-nav-bar]')).toHaveAttribute('inert');
  });

  it('marks the section the reader is in, and offers the CTA, once shown', () => {
    const { container } = render(
      <DesktopBar shown activeId="career" menuOpen={false} onToggleMenu={noop} linkClassName="" />,
    );
    expect(container.querySelector('[data-nav-bar]')).not.toHaveAttribute('inert');

    const current = [...container.querySelectorAll('[aria-current="location"]')];
    expect(current.map((a) => a.textContent)).toEqual(['Career']);

    const cta = screen.getByRole('link', { name: /business enquiries/i });
    expect(cta).toHaveAttribute('href', '#contact');
    expect(cta).toHaveAttribute('lang', 'en');
  });
});

describe('MobileMenu', () => {
  it('offers Business Enquiries, and closes as it navigates', () => {
    const onClose = vi.fn();
    render(<MobileMenu open onClose={onClose} activeId={null} />);

    const cta = screen.getByRole('link', { name: /business enquiries/i });
    expect(cta).toHaveAttribute('href', '#contact');
    expect(cta).toHaveAttribute('lang', 'en');

    fireEvent.click(cta);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
